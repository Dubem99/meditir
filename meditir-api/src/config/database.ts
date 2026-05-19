import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { encrypt, decryptDeep, isEncrypted } from '../utils/phi-crypto';

// PHI columns encrypted at rest, keyed by Prisma model name. Only free-text
// clinical content — never fields used in WHERE / orderBy.
export const ENCRYPTED_FIELDS: Record<string, string[]> = {
  SOAPNote: ['subjective', 'objective', 'assessment', 'plan', 'drugWarnings'],
  ConsultationSession: ['notes', 'handoverNote'],
  AdditionalNote: ['text'],
  Transcription: ['text'],
  NoteChatMessage: ['content'],
  PatientSummary: ['content'],
};

const WRITE_OPS = new Set(['create', 'createMany', 'update', 'updateMany', 'upsert']);

// Encrypt configured fields on a write payload. Handles a plain value or
// Prisma's `{ set: value }` form; skips null/undefined and already-enveloped.
function encryptData(fields: string[], data: Record<string, unknown> | undefined): void {
  if (!data) return;
  for (const f of fields) {
    const v = data[f];
    if (v == null) continue;
    if (typeof v === 'string' && !isEncrypted(v)) {
      data[f] = encrypt(v);
    } else if (typeof v === 'object' && 'set' in (v as object)) {
      const sv = (v as { set: unknown }).set;
      if (typeof sv === 'string' && !isEncrypted(sv)) {
        (v as { set: unknown }).set = encrypt(sv);
      }
    }
  }
}

function encryptWriteArgs(model: string, operation: string, args: Record<string, unknown>): void {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields) return;
  if (operation === 'upsert') {
    encryptData(fields, args.create as Record<string, unknown>);
    encryptData(fields, args.update as Record<string, unknown>);
    return;
  }
  const data = args.data as Record<string, unknown> | Record<string, unknown>[] | undefined;
  if (Array.isArray(data)) data.forEach((d) => encryptData(fields, d));
  else encryptData(fields, data);
}

const makeClient = () =>
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (model && ENCRYPTED_FIELDS[model] && WRITE_OPS.has(operation)) {
            encryptWriteArgs(model, operation, args as Record<string, unknown>);
          }
          const result = await query(args);
          // Decrypt is model-agnostic (envelope is self-identifying), so
          // nested includes are covered too.
          return decryptDeep(result);
        },
      },
    },
  });

type ExtendedPrisma = ReturnType<typeof makeClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrisma };

export const prisma: ExtendedPrisma = globalForPrisma.prisma ?? makeClient();

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
