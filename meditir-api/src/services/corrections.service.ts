import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Capture the diff between what the AI produced and what the doctor changed
// it to. Fire-and-forget — wraps the DB write so a logging failure can never
// break a user-facing request. Feeds the self-improvement loop downstream.

export type ArtifactType =
  | 'SOAP_SECTION'
  | 'PROBLEM'
  | 'ORDER'
  | 'BILLING_CODE';

export type CorrectionKind =
  | 'EDIT' // doctor changed text/value of an AI-generated field
  | 'DELETE' // doctor deleted an AI-generated entity
  | 'REJECT_AI' // doctor swapped FROM an AI suggestion to a different one
  | 'MANUAL_ADD' // doctor added something the AI didn't suggest
  | 'CODE_SWAP' // doctor selected a different candidate within same code system
  | 'STATUS_CHANGE'; // doctor changed status field (Problem/Order)

export interface LogCorrectionInput {
  hospitalId: string;
  doctorUserId?: string | null;
  artifactType: ArtifactType;
  artifactId: string;
  correctionKind: CorrectionKind;
  field?: string | null;
  aiValue?: unknown;
  doctorValue?: unknown;
  soapNoteId?: string | null;
  problemId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Fire-and-forget. Logs internally on failure so we have a paper trail but
// never throws into the calling request.
export const logCorrection = (input: LogCorrectionInput): void => {
  void prisma.aiCorrection
    .create({
      data: {
        hospitalId: input.hospitalId,
        doctorUserId: input.doctorUserId ?? null,
        artifactType: input.artifactType,
        artifactId: input.artifactId,
        correctionKind: input.correctionKind,
        field: input.field ?? null,
        aiValue: (input.aiValue ?? null) as never,
        doctorValue: (input.doctorValue ?? null) as never,
        soapNoteId: input.soapNoteId ?? null,
        problemId: input.problemId ?? null,
        orderId: input.orderId ?? null,
        metadata: (input.metadata ?? null) as never,
      },
    })
    .catch((err: unknown) => {
      logger.warn('Failed to log AI correction (non-fatal)', {
        artifactType: input.artifactType,
        artifactId: input.artifactId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
};

// Helper to skip logging when nothing actually changed. The hooks call this
// to avoid emitting EDIT events on no-op updates.
export const isMeaningfulChange = (a: unknown, b: unknown): boolean => {
  if (a === b) return false;
  if (a == null && b == null) return false;
  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim() !== b.trim();
  }
  return JSON.stringify(a) !== JSON.stringify(b);
};
