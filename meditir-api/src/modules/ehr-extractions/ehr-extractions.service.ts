import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const ExtractionSchema = z.object({
  problems: z.array(
    z.object({
      name: z.string().min(1),
      icd10Code: z.string().optional().nullable(),
      status: z.enum(['ACTIVE', 'RESOLVED', 'CHRONIC', 'RULE_OUT']).default('ACTIVE'),
      notes: z.string().optional().nullable(),
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
    })
  ).default([]),
  billingCodes: z.array(
    z.object({
      codeType: z.enum(['ICD10', 'CPT']),
      code: z.string().min(1),
      description: z.string().min(1),
    })
  ).default([]),
});

type Extraction = z.infer<typeof ExtractionSchema>;

const EXTRACTION_SYSTEM_PROMPT = `You are a clinical coding and EHR extraction assistant for Nigerian hospitals.
Given a finalized SOAP note, extract three structured lists:

1. PROBLEMS — distinct clinical problems / diagnoses / differentials mentioned in the Assessment.
   - Include ICD-10 code when confident. Use null if unsure.
   - status: ACTIVE (current), CHRONIC (long-standing), RESOLVED (already cleared), RULE_OUT (differential being excluded).

2. ORDERS — actionable items in the Plan. One order per discrete action.
   - type: MEDICATION | LAB | IMAGING | PROCEDURE | REFERRAL
   - For MEDICATION: fill dosage, frequency, duration when stated. Use Nigerian drug names where mentioned.
   - For LAB/IMAGING: the test name (e.g., "FBC", "Chest X-ray").
   - For REFERRAL: specialty or facility.

3. BILLING CODES — ICD-10 codes for the primary diagnoses and CPT codes for procedures/visit-level services.
   - Include the short description for each code.
   - Only emit codes you are confident about.

Rules:
- Only extract items explicitly supported by the SOAP note. Do not invent.
- If a section has nothing, return an empty array.
- Respond ONLY with a valid JSON object matching the schema below. No markdown, no commentary.

JSON format:
{
  "problems": [{"name": "...", "icd10Code": "J45.9", "status": "ACTIVE", "notes": null}],
  "orders": [{"type": "MEDICATION", "name": "Salbutamol inhaler", "dosage": "100mcg", "frequency": "2 puffs PRN", "duration": "30 days", "instructions": null}],
  "billingCodes": [{"codeType": "ICD10", "code": "J45.9", "description": "Asthma, unspecified"}]
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
      max_tokens: 2048,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `SOAP Note:\n${noteText}` }],
    });
    const content = response.content[0];
    if (content.type !== 'text') return null;
    parsed = ExtractionSchema.parse(JSON.parse(stripFence(content.text)));
  } catch (err) {
    logger.error('EHR extraction failed', { error: err, soapNoteId });
    return null;
  }

  await prisma.$transaction(async (tx) => {
    // Wipe prior AI-extracted rows so re-runs don't duplicate. Keep doctor-added.
    await tx.problem.deleteMany({ where: { soapNoteId, source: 'AI_EXTRACTED' } });
    await tx.order.deleteMany({ where: { soapNoteId, source: 'AI_EXTRACTED' } });
    await tx.billingCode.deleteMany({ where: { soapNoteId, source: 'AI_EXTRACTED' } });

    if (parsed.problems.length > 0) {
      await tx.problem.createMany({
        data: parsed.problems.map((p) => ({
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          name: p.name,
          icd10Code: p.icd10Code ?? null,
          status: p.status,
          notes: p.notes ?? null,
        })),
      });
    }

    if (parsed.orders.length > 0) {
      await tx.order.createMany({
        data: parsed.orders.map((o) => ({
          soapNoteId,
          hospitalId: note.hospitalId,
          patientId: note.patientId,
          type: o.type,
          name: o.name,
          dosage: o.dosage ?? null,
          frequency: o.frequency ?? null,
          duration: o.duration ?? null,
          instructions: o.instructions ?? null,
        })),
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

  const [problems, orders, billingCodes] = await Promise.all([
    prisma.problem.findMany({ where: { soapNoteId: note.id }, orderBy: { createdAt: 'asc' } }),
    prisma.order.findMany({ where: { soapNoteId: note.id }, orderBy: { createdAt: 'asc' } }),
    prisma.billingCode.findMany({ where: { soapNoteId: note.id }, orderBy: { createdAt: 'asc' } }),
  ]);

  return { soapNoteId: note.id, problems, orders, billingCodes };
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

export const deleteBillingCode = async (id: string, hospitalId: string) => {
  const existing = await prisma.billingCode.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Billing code not found', 404);
  await prisma.billingCode.delete({ where: { id } });
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
