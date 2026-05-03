import { prisma } from '../../config/database';

// Aggregate-only analytics on the AiCorrection table. Returns no row-level
// PHI — only counts and breakdowns. Hospital identities are anonymized
// (Hospital A / B / C) so super-admin browsing never leaks names.

export interface CorrectionsAnalytics {
  windowDays: number;
  generatedAt: string;
  totalCorrections: number;
  byKind: Record<string, number>;
  byArtifactType: Record<string, number>;
  bySoapField: Record<string, number>;
  byBillingCodeType: Record<string, number>;
  weeklyTrend: { week: string; count: number }[];
  perHospitalAnonymized: { label: string; count: number }[];
  insights: {
    estimatedAccuracy: number | null;
    aiRejectionRate: number | null;
    manualAddRate: number | null;
    swapRate: number | null;
  };
  // Transcription-edit metrics — privacy-preserving STT accuracy proxy.
  // No raw transcript text is read; only the diff stats stored in
  // TranscriptionEdit rows.
  transcription: {
    totalEdits: number;
    totalTranscriptions: number;
    untouchedRate: number | null; // share of transcriptions never edited
    avgWordsChangedPerEdit: number | null;
    byDialect: { dialect: string; edits: number; transcriptions: number; editRate: number | null }[];
    byEditType: Record<string, number>;
  };
}

const isoWeek = (d: Date): string => {
  // Returns YYYY-Www. Aligns to ISO 8601 Monday-start weeks.
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

export const getCorrectionsAnalytics = async (
  windowDays: number
): Promise<CorrectionsAnalytics> => {
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const generatedAt = new Date().toISOString();

  // Fetch only the columns we need — never doctorValue/aiValue/metadata
  // which contain PHI fragments.
  const rows = await prisma.aiCorrection.findMany({
    where: { createdAt: { gte: cutoff } },
    select: {
      hospitalId: true,
      artifactType: true,
      correctionKind: true,
      field: true,
      createdAt: true,
    },
  });

  const totalCorrections = rows.length;
  const byKind: Record<string, number> = {};
  const byArtifactType: Record<string, number> = {};
  const bySoapField: Record<string, number> = {};
  const weekCounts: Record<string, number> = {};
  const hospitalCounts: Record<string, number> = {};

  for (const r of rows) {
    byKind[r.correctionKind] = (byKind[r.correctionKind] ?? 0) + 1;
    byArtifactType[r.artifactType] = (byArtifactType[r.artifactType] ?? 0) + 1;
    if (r.artifactType === 'SOAP_SECTION' && r.field) {
      bySoapField[r.field] = (bySoapField[r.field] ?? 0) + 1;
    }
    const w = isoWeek(r.createdAt);
    weekCounts[w] = (weekCounts[w] ?? 0) + 1;
    hospitalCounts[r.hospitalId] = (hospitalCounts[r.hospitalId] ?? 0) + 1;
  }

  // Billing-code corrections need a separate query so we can group by codeType
  // (which lives in metadata or the artifact itself) — fetch a second pass
  // that joins to the BillingCode table to get codeType.
  const billingRows = await prisma.aiCorrection.findMany({
    where: {
      createdAt: { gte: cutoff },
      artifactType: 'BILLING_CODE',
    },
    select: { artifactId: true, correctionKind: true },
  });

  const billingIds = billingRows.map((r) => r.artifactId);
  const billingCodes = billingIds.length
    ? await prisma.billingCode.findMany({
        where: { id: { in: billingIds } },
        select: { id: true, codeType: true },
      })
    : [];
  const codeTypeById = new Map(billingCodes.map((c) => [c.id, c.codeType]));
  const byBillingCodeType: Record<string, number> = {};
  for (const br of billingRows) {
    const codeType = codeTypeById.get(br.artifactId);
    if (!codeType) continue; // BillingCode was deleted — can't categorize
    byBillingCodeType[codeType] = (byBillingCodeType[codeType] ?? 0) + 1;
  }

  // Weekly trend — sorted ISO-week ascending
  const weeklyTrend = Object.entries(weekCounts)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([week, count]) => ({ week, count }));

  // Anonymize hospitals: stable label letters A, B, C, … sorted by count desc
  // so the busiest hospital is always "Hospital A". This way the founder
  // sees patterns without seeing names.
  const sortedHospitals = Object.entries(hospitalCounts).sort(([, a], [, b]) => b - a);
  const perHospitalAnonymized = sortedHospitals.map(([, count], i) => ({
    label: `Hospital ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ''}`,
    count,
  }));

  // Insight ratios — use the corrections data as a proxy for AI accuracy.
  // These are rough indicators, not statistically rigorous.
  const totalSoapNotes = await prisma.sOAPNote.count({
    where: { createdAt: { gte: cutoff } },
  });
  const totalBillingCodes = await prisma.billingCode.count({
    where: { createdAt: { gte: cutoff }, source: 'AI_EXTRACTED' },
  });

  const ratio = (num: number, den: number): number | null =>
    den > 0 ? Math.round((num / den) * 1000) / 1000 : null;

  const insights = {
    // % of SOAP notes that didn't get any correction event
    estimatedAccuracy: ratio(
      Math.max(0, totalSoapNotes - (byArtifactType.SOAP_SECTION ?? 0)),
      totalSoapNotes
    ),
    aiRejectionRate: ratio(byKind.REJECT_AI ?? 0, totalCorrections || 1),
    manualAddRate: ratio(byKind.MANUAL_ADD ?? 0, totalBillingCodes || 1),
    swapRate: ratio(byKind.CODE_SWAP ?? 0, totalBillingCodes || 1),
  };

  // Transcription edit metrics — read only the stat columns, never raw text.
  const editRows = await prisma.transcriptionEdit.findMany({
    where: { createdAt: { gte: cutoff } },
    select: {
      dialect: true,
      editType: true,
      wordsAdded: true,
      wordsRemoved: true,
      transcriptionId: true,
    },
  });
  const totalTranscriptions = await prisma.transcription.count({
    where: { createdAt: { gte: cutoff } },
  });
  const transcriptionsEditedSet = new Set(editRows.map((r) => r.transcriptionId));
  const untouched = Math.max(0, totalTranscriptions - transcriptionsEditedSet.size);
  const totalEdits = editRows.length;
  const totalWordsChanged = editRows.reduce((s, r) => s + r.wordsAdded + r.wordsRemoved, 0);

  const byEditType: Record<string, number> = {};
  for (const r of editRows) {
    byEditType[r.editType] = (byEditType[r.editType] ?? 0) + 1;
  }

  // Per-dialect roll-up: edits and transcriptions counted per dialect, plus
  // an "edit rate" (edits per transcription) as the rough STT-accuracy proxy.
  const dialects = ['ENGLISH', 'PIDGIN', 'NIGERIAN_ENGLISH', 'YORUBA_ACCENTED', 'HAUSA_ACCENTED', 'IGBO_ACCENTED'];
  const byDialect = await Promise.all(
    dialects.map(async (d) => {
      const transcriptions = await prisma.transcription.count({
        where: { createdAt: { gte: cutoff }, dialect: d as never },
      });
      const edits = editRows.filter((r) => r.dialect === d).length;
      const editRate = transcriptions > 0 ? Math.round((edits / transcriptions) * 1000) / 1000 : null;
      return { dialect: d, edits, transcriptions, editRate };
    })
  );

  const transcription = {
    totalEdits,
    totalTranscriptions,
    untouchedRate: ratio(untouched, totalTranscriptions || 1),
    avgWordsChangedPerEdit:
      totalEdits > 0 ? Math.round((totalWordsChanged / totalEdits) * 100) / 100 : null,
    byDialect: byDialect.filter((d) => d.transcriptions > 0 || d.edits > 0),
    byEditType,
  };

  return {
    windowDays,
    generatedAt,
    totalCorrections,
    byKind,
    byArtifactType,
    bySoapField,
    byBillingCodeType,
    weeklyTrend,
    perHospitalAnonymized,
    insights,
    transcription,
  };
};
