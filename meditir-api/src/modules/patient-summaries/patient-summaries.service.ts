import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { sendPatientSummaryEmail } from '../../services/email.service';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export type SummaryLanguage = 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'HAUSA' | 'IGBO';
export type DeliveryChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PRINT';

const languageInstructions: Record<SummaryLanguage, string> = {
  ENGLISH: 'Write in simple, clear English at a 6th–8th grade reading level. Avoid medical jargon.',
  PIDGIN: 'Write in Nigerian Pidgin English. Keep it warm, conversational, and easy to understand. Example: "Doctor check you today because..." instead of "You were evaluated for..."',
  YORUBA: 'Write entirely in Yoruba using proper Yoruba spelling and diacritics. Keep medical terms simple. Use Latin letters (no IPA).',
  HAUSA: 'Write entirely in Hausa using standard Hausa orthography. Keep medical terms simple.',
  IGBO: 'Write entirely in Igbo using standard Igbo orthography with diacritics. Keep medical terms simple.',
};

const buildSystemPrompt = (language: SummaryLanguage) => `You are writing a patient after-visit summary (AVS) for a hospital in Nigeria.

Your audience is the PATIENT, not a clinician. ${languageInstructions[language]}

Output structure (use these exact headings as markdown H2):
## Why you came in today
(1–2 sentences explaining the reason for the visit in plain words)

## What we found
(Explain the diagnosis in plain words. If there are multiple diagnoses, list each one briefly.)

## Your medications
(For each medication: name, simple dosage like "1 tablet 3 times a day", what it's for, how long to take it, and one key instruction like "take with food" or "do not stop early". Use a bulleted list.)

## Tests, scans, or referrals
(Any labs, imaging, or referrals. If none, write "None today.")

## Warning signs — come back immediately if:
(A bulleted list of red-flag symptoms specific to the diagnosis. Always include generic ones like difficulty breathing, severe pain, high fever, fainting.)

## Taking care of yourself at home
(Simple lifestyle tips relevant to the diagnosis — rest, hydration, diet, activity, etc.)

## Your next visit
(Follow-up instructions — when to return, with whom, or what to bring.)

Rules:
- Warm, encouraging tone. Address the patient as "you".
- Short sentences. No abbreviations (say "three times a day", not "TDS").
- Never invent information not in the SOAP note. If a section has no content, write a simple line like "Nothing to note today."
- Respond with ONLY the markdown content. No commentary, no code fences, no preamble.`;

export const generatePatientSummary = async (
  soapNoteId: string,
  hospitalId: string,
  language: SummaryLanguage = 'ENGLISH'
) => {
  const note = await prisma.sOAPNote.findFirst({
    where: { id: soapNoteId, hospitalId },
    include: { patient: { select: { firstName: true, lastName: true } } },
  });
  if (!note) throw new AppError('SOAP note not found', 404);

  const noteText = `Patient: ${note.patient.firstName} ${note.patient.lastName}

Subjective:
${note.subjective}

Objective:
${note.objective}

Assessment:
${note.assessment}

Plan:
${note.plan}`;

  let content: string;
  try {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 2048,
      system: buildSystemPrompt(language),
      messages: [{ role: 'user', content: `SOAP Note:\n${noteText}` }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude');
    content = block.text.trim().replace(/^```(?:markdown)?\s*/i, '').replace(/\s*```$/, '').trim();
  } catch (err) {
    logger.error('Patient summary generation failed', { error: err, soapNoteId });
    throw new AppError('Failed to generate patient summary. Please try again.', 503);
  }

  const summary = await prisma.patientSummary.create({
    data: {
      soapNoteId,
      hospitalId,
      patientId: note.patientId,
      language,
      content,
      sentVia: [],
    },
  });

  return summary;
};

export const listForSession = async (sessionId: string, hospitalId: string) => {
  const note = await prisma.sOAPNote.findUnique({ where: { sessionId } });
  if (!note || note.hospitalId !== hospitalId) {
    throw new AppError('SOAP note not found', 404);
  }
  return prisma.patientSummary.findMany({
    where: { soapNoteId: note.id },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateSummary = async (
  id: string,
  hospitalId: string,
  data: { content?: string }
) => {
  const existing = await prisma.patientSummary.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Patient summary not found', 404);
  return prisma.patientSummary.update({
    where: { id },
    data: { ...data, edited: true },
  });
};

export const deleteSummary = async (id: string, hospitalId: string) => {
  const existing = await prisma.patientSummary.findFirst({ where: { id, hospitalId } });
  if (!existing) throw new AppError('Patient summary not found', 404);
  await prisma.patientSummary.delete({ where: { id } });
};

const buildWhatsAppLink = (phone: string | null | undefined, content: string): string | null => {
  if (!phone) return null;
  // Strip everything except digits, drop leading 0, default to Nigeria country code
  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  const normalized = digits.startsWith('234') ? digits : `234${digits}`;
  // WhatsApp click-to-chat has a practical ~4000 char URL limit; trim if needed
  const trimmed = content.length > 3500 ? `${content.slice(0, 3500)}\n\n…(continued)` : content;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(trimmed)}`;
};

export const sendSummary = async (
  id: string,
  hospitalId: string,
  channels: DeliveryChannel[]
) => {
  const summary = await prisma.patientSummary.findFirst({
    where: { id, hospitalId },
    include: {
      soapNote: {
        include: {
          session: { include: { doctor: { select: { firstName: true, lastName: true, specialization: true } } } },
        },
      },
    },
  });
  if (!summary) throw new AppError('Patient summary not found', 404);

  const patient = await prisma.patient.findUnique({
    where: { id: summary.patientId },
    select: { firstName: true, lastName: true, phone: true, user: { select: { email: true } } },
  });
  if (!patient) throw new AppError('Patient not found', 404);

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { name: true },
  });

  const results: Record<string, { ok: boolean; detail?: string; link?: string }> = {};
  const doctor = summary.soapNote.session.doctor;

  for (const channel of channels) {
    if (channel === 'EMAIL') {
      if (!patient.user?.email) {
        results.EMAIL = { ok: false, detail: 'Patient has no email on file' };
        continue;
      }
      try {
        await sendPatientSummaryEmail({
          patientEmail: patient.user.email,
          patientFirstName: patient.firstName,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          hospitalName: hospital?.name ?? 'Your hospital',
          contentMarkdown: summary.content,
          language: summary.language as SummaryLanguage,
        });
        results.EMAIL = { ok: true };
      } catch (err) {
        logger.error('AVS email send failed', { error: err, summaryId: id });
        results.EMAIL = { ok: false, detail: 'Email delivery failed' };
      }
    } else if (channel === 'WHATSAPP') {
      const link = buildWhatsAppLink(patient.phone, summary.content);
      if (!link) {
        results.WHATSAPP = { ok: false, detail: 'Patient has no phone on file' };
      } else {
        // MVP: return click-to-chat link for the doctor to open. No automated send.
        results.WHATSAPP = { ok: true, link };
      }
    } else if (channel === 'PRINT') {
      results.PRINT = { ok: true };
    } else if (channel === 'SMS') {
      results.SMS = { ok: false, detail: 'SMS not configured yet' };
    }
  }

  // Record which channels were used (merge with existing)
  const successful = Object.entries(results)
    .filter(([, v]) => v.ok)
    .map(([k]) => k);
  const mergedSentVia = Array.from(new Set([...summary.sentVia, ...successful]));

  const updated = await prisma.patientSummary.update({
    where: { id },
    data: {
      sentVia: mergedSentVia,
      sentAt: successful.length > 0 ? new Date() : summary.sentAt,
    },
  });

  return { summary: updated, results };
};
