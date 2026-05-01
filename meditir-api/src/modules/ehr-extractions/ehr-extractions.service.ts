import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { NHIA_TARIFF_PRIMARY_CARE } from '../../data/nhia-tariff';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const CodeCandidateSchema = z.object({
  codeType: z.enum(['ICD10', 'SNOMED']),
  code: z.string().min(1),
  description: z.string().min(1),
  isSelected: z.boolean().default(false),
});

const NhiaCodeSchema = z.object({
  code: z.string().regex(/^NHIS-\d{3}-\d{3}$/, 'Must be NHIS-XXX-XXX format'),
  description: z.string().min(1),
  tariffNgn: z.number().int().nullable().optional(),
});

const ExtractionSchema = z.object({
  problems: z.array(
    z.object({
      name: z.string().min(1),
      icd10Code: z.string().optional().nullable(),
      status: z.enum(['ACTIVE', 'RESOLVED', 'CHRONIC', 'RULE_OUT']).default('ACTIVE'),
      notes: z.string().optional().nullable(),
      codes: z.array(CodeCandidateSchema).default([]),
    })
  ).default([]),
  orders: z.array(
    z.object({
      type: z.enum(['MEDICATION', 'LAB', 'IMAGING', 'PROCEDURE', 'REFERRAL']),
      name: z.string().min(1),
      dosage: z.string().optional().nullable(),
      frequency: z.string().optional().nullable(),
      duration: z.string().optional().nullable(),
      instructions: z.string().optional().nullable(),
      nhiaCode: NhiaCodeSchema.optional().nullable(),
    })
  ).default([]),
  billingCodes: z.array(
    z.object({
      codeType: z.enum(['CPT']),
      code: z.string().min(1),
      description: z.string().min(1),
    })
  ).default([]),
  visitNhiaCode: NhiaCodeSchema.optional().nullable(),
});

type Extraction = z.infer<typeof ExtractionSchema>;

// Lookup table to validate AI's NHIA picks against the catalog and pull
// authoritative description + tariff (overriding whatever the model emits).
const NHIA_BY_CODE = new Map(
  NHIA_TARIFF_PRIMARY_CARE.map((e) => [e.code, e])
);

const formatNhiaCatalogForPrompt = (): string =>
  NHIA_TARIFF_PRIMARY_CARE
    .map((e) => `${e.code} | ${e.description}${e.tariffNgn ? ` | ₦${e.tariffNgn}` : ''}`)
    .join('\n');

const buildExtractionPrompt = () => `You are a clinical coding and EHR extraction assistant for Nigerian hospitals.
Given a finalized SOAP note, extract structured lists for the EHR and Nigerian
health insurance billing.

1. PROBLEMS — distinct clinical problems / diagnoses / differentials mentioned in the Assessment.
   - status: ACTIVE (current), CHRONIC (long-standing), RESOLVED (already cleared), RULE_OUT (differential being excluded).
   - icd10Code: your single best ICD-10 pick (kept for back-compat). Use null if unsure.
   - codes: 2-4 coding candidates per Problem, drawing from BOTH:
     * ICD10 — 1-2 plausible ICD-10 codes (most-likely first)
     * SNOMED — 1-2 SNOMED CT concept IDs (numeric, e.g., "41582007")
   - Mark exactly ONE code as isSelected=true per code system per Problem (your best guess).
   - Only emit codes you are highly confident about. Omit SNOMED rather than guess the ID.

2. ORDERS — actionable items in the Plan. One order per discrete action.
   - type: MEDICATION | LAB | IMAGING | PROCEDURE | REFERRAL
   - MEDICATION: fill dosage, frequency, duration when stated. Use Nigerian drug names where mentioned.
   - LAB/IMAGING: the test name (e.g., "FBC", "Chest X-ray").
   - REFERRAL: specialty or facility.
   - nhiaCode (LAB / IMAGING / PROCEDURE only): the matching NHIS tariff code from the
     CATALOG below. Omit (null) if no clear match. Never invent a code that isn't in the
     catalog. Skip nhiaCode for MEDICATION and REFERRAL orders entirely.

3. BILLING_CODES — visit-level CPT codes only.
   - Diagnosis-level codes belong in PROBLEMS.codes, not here.

4. VISIT_NHIA_CODE — the consultation-level NHIS tariff for this visit.
   - Pick from the CONSULTATION section of the catalog (NHIS-010-XXX) based on the
     visit type (initial vs review vs nursing). Omit if unclear.

═══ NHIS TARIFF CATALOG (source of truth — only emit codes from this list) ═══
${formatNhiaCatalogForPrompt()}
═══ END CATALOG ═══

Rules:
- Only extract items explicitly supported by the SOAP note. Do not invent.
- For NHIA codes, only emit codes that appear verbatim in the catalog above.
- Respond ONLY with a valid JSON object. No markdown, no commentary.

JSON format:
{
  "problems": [{
    "name": "Streptococcal tonsillitis",
    "icd10Code": "J03.0",
    "status": "ACTIVE",
    "notes": null,
    "codes": [
      {"codeType": "ICD10", "code": "J03.0", "description": "Streptococcal tonsillitis", "isSelected": true},
      {"codeType": "SNOMED", "code": "41582007", "description": "Streptococcal tonsillitis", "isSelected": true}
    ]
  }],
  "orders": [
    {"type": "LAB", "name": "Full Blood Count", "nhiaCode": {"code": "NHIS-181-101", "description": "Full Blood Count (FBC) (All Parameters)"}},
    {"type": "MEDICATION", "name": "Amoxicillin", "dosage": "500mg", "frequency": "TDS", "duration": "7 days"}
  ],
  "billingCodes": [],
  "visitNhiaCode": {"code": "NHIS-010-001", "description": "Specialist Initial Consultation"}
}`;

const stripFence = (s: string) =>
  s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

export const extractFromSOAPNote = async (soapNoteId: string): Promise<Extraction | null> => {
  const note = await prisma.sOAPNote.findUnique({ where: { id: soapNoteId } });
  if (!note) return null;

  const noteText = `Subjective:\n${note.subjective}\n\nObjective:\n${note.objective}\n\nAssessment:\n${note.assessment}\n\nPlan:\n${note.plan}`;

  let parsed: Extraction;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 4096,
      system: buildExtractionPrompt(),
      messages: [{ role: 'user', content: `SOAP Note:\n${noteText}` }],
    });
    const content = response.content[0];
    if (content.type !== 'text') return null;
    parsed = ExtractionSchema.parse(JSON.parse(stripFence(content.text)));
  } catch (err) {
    logger.error('EHR extraction failed', { error: err, soapNoteId });
    return null;
  }

  // Validate AI's NHIA picks against the catalog. Drop anything not in our list,
  // and override with the canonical description + tariff so a typo or
  // hallucination can never persist.
  const validateNhia = (
    raw: { code: string; description: string; tariffNgn?: number | null } | null | undefined
  ) => {
    if (!raw) return null;
    const entry = NHIA_BY_CODE.get(raw.code);
    if (!entry) return null;
    return {
      code: entry.code,
      description: entry.description,
      tariffNgn: entry.tariffNgn,
    };
  };

  await prisma.$transaction(async (tx) => {
    // Wipe prior AI-extracted rows so re-runs don't duplicate. Keep doctor-added.
    // BillingCodes cascade-delete with parent Problem/Order, so deleting
    // AI-extracted Problems and Orders clears their attached codes automatically.
    await tx.problem.deleteMany({ where: { soapNoteId, source: 'AI_EXTRACTED' } });
    await tx.order.deleteMany({ where: { soapNoteId, source: 'AI_EXTRACTED' } });
    // Wipe visit-level (problemId=null AND orderId=null) AI billing codes —
    // problem and order codes are already gone via cascade.
    await tx.billingCode.deleteMany({
      where: { soapNoteId, source: 'AI_EXTRACTED', problemId: null, orderId: null },
    });

    for (const p of parsed.problems) {
      await tx.problem.create({
        data: {
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          name: p.name,
          icd10Code: p.icd10Code ?? null,
          status: p.status,
          notes: p.notes ?? null,
          billingCodes: {
            create: p.codes.map((c) => ({
              soapNoteId,
              hospitalId: note.hospitalId,
              patientId: note.patientId,
              codeType: c.codeType,
              code: c.code,
              description: c.description,
              isSelected: c.isSelected,
            })),
          },
        },
      });
    }

    for (const o of parsed.orders) {
      const nhia = validateNhia(o.nhiaCode);
      await tx.order.create({
        data: {
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          type: o.type,
          name: o.name,
          dosage: o.dosage ?? null,
          frequency: o.frequency ?? null,
          duration: o.duration ?? null,
          instructions: o.instructions ?? null,
          billingCodes: nhia
            ? {
                create: [
                  {
                    soapNoteId,
                    hospitalId: note.hospitalId,
                    patientId: note.patientId,
                    codeType: 'NHIA',
                    code: nhia.code,
                    description: nhia.description,
                    tariffNgn: nhia.tariffNgn,
                    isSelected: true,
                  },
                ],
              }
            : undefined,
        },
      });
    }

    const visitNhia = validateNhia(parsed.visitNhiaCode);
    if (visitNhia) {
      await tx.billingCode.create({
        data: {
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          codeType: 'NHIA',
          code: visitNhia.code,
          description: visitNhia.description,
          tariffNgn: visitNhia.tariffNgn,
          isSelected: true,
        },
      });
    }

    if (parsed.billingCodes.length > 0) {
      await tx.billingCode.createMany({
        data: parsed.billingCodes.map((c) => ({
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          codeType: c.codeType,
          code: c.code,
          description: c.description,
        })),
      });
    }
  });

  return parsed;
};

export const getExtractionsForSession = async (sessionId: string, hospitalId: string) => {
  const note = await prisma.sOAPNote.findUnique({ where: { sessionId } });
  if (!note || note.hospitalId !== hospitalId) {
    throw new AppError('SOAP note not found', 404);
  }

  const [problems, orders, visitLevelCodes] = await Promise.all([
    prisma.problem.findMany({
      where: { soapNoteId: note.id },
      orderBy: { createdAt: 'asc' },
      include: { billingCodes: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.order.findMany({
      where: { soapNoteId: note.id },
      orderBy: { createdAt: 'asc' },
      include: { billingCodes: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.billingCode.findMany({
      where: { soapNoteId: note.id, problemId: null, orderId: null },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return { soapNoteId: note.id, problems, orders, billingCodes: visitLevelCodes };
};

export const updateProblem = async (
  id: string,
  hospitalId: string,
  data: { name?: string; icd10Code?: string | null; status?: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'RULE_OUT'; notes?: string | null }
) => {
  const existing = await prisma.problem.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Problem not found', 404);
  return prisma.problem.update({
    where: { id },
    data: { ...data, source: 'DOCTOR_EDITED' },
  });
};

export const updateOrder = async (
  id: string,
  hospitalId: string,
  data: {
    name?: string;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
    status?: 'PENDING' | 'ORDERED' | 'COMPLETED' | 'CANCELLED';
  }
) => {
  const existing = await prisma.order.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Order not found', 404);
  return prisma.order.update({
    where: { id },
    data: { ...data, source: 'DOCTOR_EDITED' },
  });
};

export const deleteProblem = async (id: string, hospitalId: string) => {
  const existing = await prisma.problem.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Problem not found', 404);
  await prisma.problem.delete({ where: { id } });
};

export const deleteOrder = async (id: string, hospitalId: string) => {
  const existing = await prisma.order.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Order not found', 404);
  await prisma.order.delete({ where: { id } });
};

// Read-only access to the NHIA tariff catalog (primary-care subset). Used by
// the UI to render a dropdown when the doctor manually adds an NHIA code.
export const getNhiaCatalog = () =>
  NHIA_TARIFF_PRIMARY_CARE.map((e) => ({
    code: e.code,
    description: e.description,
    tariffNgn: e.tariffNgn,
    section: e.section,
  }));

export const deleteBillingCode = async (id: string, hospitalId: string) => {
  const existing = await prisma.billingCode.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Billing code not found', 404);
  await prisma.billingCode.delete({ where: { id } });
};

export const addBillingCode = async (
  hospitalId: string,
  data: {
    problemId?: string | null;
    orderId?: string | null;
    soapNoteId?: string | null;
    codeType: string;
    code: string;
    description: string;
    tariffNgn?: number | null;
  }
) => {
  const code = data.code.trim();
  const description = data.description.trim();
  if (!code) throw new AppError('Code is required', 400);
  if (!description) throw new AppError('Description is required', 400);

  // Resolve parent: a code attaches to either a Problem, an Order, or
  // visit-level (no parent — pass soapNoteId directly).
  let parentSoapNoteId: string;
  let parentPatientId: string;
  let scopedProblemId: string | null = null;
  let scopedOrderId: string | null = null;

  if (data.problemId) {
    const problem = await prisma.problem.findFirst({
      where: { id: data.problemId, hospitalId },
    });
    if (!problem) throw new AppError('Problem not found', 404);
    parentSoapNoteId = problem.soapNoteId;
    parentPatientId = problem.patientId;
    scopedProblemId = problem.id;
  } else if (data.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, hospitalId },
    });
    if (!order) throw new AppError('Order not found', 404);
    parentSoapNoteId = order.soapNoteId;
    parentPatientId = order.patientId;
    scopedOrderId = order.id;
  } else if (data.soapNoteId) {
    const note = await prisma.sOAPNote.findFirst({
      where: { id: data.soapNoteId, hospitalId },
    });
    if (!note) throw new AppError('SOAP note not found', 404);
    parentSoapNoteId = note.id;
    parentPatientId = note.patientId;
  } else {
    throw new AppError('problemId, orderId, or soapNoteId is required', 400);
  }

  return prisma.$transaction(async (tx) => {
    // New code becomes the selection; deselect existing siblings within the
    // same scope + same code system.
    if (scopedProblemId) {
      await tx.billingCode.updateMany({
        where: { problemId: scopedProblemId, codeType: data.codeType },
        data: { isSelected: false },
      });
    } else if (scopedOrderId) {
      await tx.billingCode.updateMany({
        where: { orderId: scopedOrderId, codeType: data.codeType },
        data: { isSelected: false },
      });
    } else {
      // Visit-level: deselect siblings (problemId=null AND orderId=null AND same soapNoteId).
      await tx.billingCode.updateMany({
        where: {
          soapNoteId: parentSoapNoteId,
          problemId: null,
          orderId: null,
          codeType: data.codeType,
        },
        data: { isSelected: false },
      });
    }
    return tx.billingCode.create({
      data: {
        soapNoteId: parentSoapNoteId,
        hospitalId,
        patientId: parentPatientId,
        problemId: scopedProblemId,
        orderId: scopedOrderId,
        codeType: data.codeType,
        code,
        description,
        tariffNgn: data.tariffNgn ?? null,
        isSelected: true,
        source: 'DOCTOR_ADDED',
      },
    });
  });
};

// Toggle isSelected on a candidate code. When selecting, atomically deselect
// siblings — same Problem + same code system — so each system has at most one
// selection per Problem. Visit-level codes (problemId=null) are independent.
export const selectBillingCode = async (
  id: string,
  hospitalId: string,
  isSelected: boolean
) => {
  const existing = await prisma.billingCode.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Billing code not found', 404);

  return prisma.$transaction(async (tx) => {
    if (isSelected && existing.problemId) {
      await tx.billingCode.updateMany({
        where: {
          problemId: existing.problemId,
          codeType: existing.codeType,
          id: { not: id },
        },
        data: { isSelected: false },
      });
    }
    return tx.billingCode.update({
      where: { id },
      data: { isSelected, source: 'DOCTOR_EDITED' },
    });
  });
};

export const addProblem = async (
  soapNoteId: string,
  hospitalId: string,
  data: { name: string; icd10Code?: string | null; status?: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'RULE_OUT'; notes?: string | null }
) => {
  const note = await prisma.sOAPNote.findFirst({ where: { id: soapNoteId, hospitalId } });
  if (!note) throw new AppError('SOAP note not found', 404);
  return prisma.problem.create({
    data: {
      soapNoteId,
      hospitalId,
      patientId: note.patientId,
      name: data.name,
      icd10Code: data.icd10Code ?? null,
      status: data.status ?? 'ACTIVE',
      notes: data.notes ?? null,
      source: 'DOCTOR_ADDED',
    },
  });
};
