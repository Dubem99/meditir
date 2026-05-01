import { prisma } from '../../config/database';

// Read-only NHIA accuracy sample for the weekly audit routine. Returns
// recent NHIA codes joined with truncated SOAP context so an external
// auditor (the scheduled remote agent) can judge code-vs-service accuracy
// without ever seeing full free-text patient histories.

export interface NhiaAuditRow {
  id: string;
  code: string;
  description: string;
  tariffNgn: number | null;
  source: string;
  scope: 'visit' | 'order' | 'problem' | 'unknown';
  createdAt: string;
  // Truncated free-text context for accuracy judgment.
  orderName: string | null;
  orderType: string | null;
  orderInstructions: string | null;
  assessmentExcerpt: string | null;
  planExcerpt: string | null;
}

const TRUNC_LIMIT = 200;
const truncate = (s: string | null | undefined): string | null => {
  if (!s) return null;
  return s.length > TRUNC_LIMIT ? s.slice(0, TRUNC_LIMIT) + '…' : s;
};

const scopeOf = (problemId: string | null, orderId: string | null): NhiaAuditRow['scope'] => {
  if (orderId) return 'order';
  if (problemId) return 'problem';
  if (problemId === null && orderId === null) return 'visit';
  return 'unknown';
};

export const sampleNhiaCodesForAudit = async (
  days: number,
  limit: number
): Promise<{ windowDays: number; sampledAt: string; rows: NhiaAuditRow[] }> => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.billingCode.findMany({
    where: {
      codeType: 'NHIA',
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      order: { select: { name: true, type: true, instructions: true } },
      soapNote: { select: { assessment: true, plan: true } },
    },
  });

  return {
    windowDays: days,
    sampledAt: new Date().toISOString(),
    rows: rows.map((r) => ({
      id: r.id,
      code: r.code,
      description: r.description,
      tariffNgn: r.tariffNgn,
      source: r.source,
      scope: scopeOf(r.problemId, r.orderId),
      createdAt: r.createdAt.toISOString(),
      orderName: r.order?.name ?? null,
      orderType: r.order?.type ?? null,
      orderInstructions: truncate(r.order?.instructions ?? null),
      assessmentExcerpt: truncate(r.soapNote?.assessment ?? null),
      planExcerpt: truncate(r.soapNote?.plan ?? null),
    })),
  };
};
