// One-off: dump transcription + session shape for a given session ID.
// Usage: AUDIT_DATABASE_URL=<public_url> node scripts/check-session.mjs <sessionId>
import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.AUDIT_DATABASE_URL || process.env.DATABASE_URL;
const sessionId = process.argv[2];
if (!dbUrl || !sessionId) {
  console.error('Usage: AUDIT_DATABASE_URL=... node scripts/check-session.mjs <sessionId>');
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: dbUrl });

try {
  const session = await prisma.consultationSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      startedAt: true,
      endedAt: true,
      noteGenerationError: true,
      _count: { select: { transcriptions: true, additionalNotes: true } },
    },
  });
  console.log('SESSION:', JSON.stringify(session, null, 2));

  const rows = await prisma.transcription.findMany({
    where: { sessionId },
    orderBy: { startMs: 'asc' },
    select: { id: true, startMs: true, endMs: true, text: true, dialect: true, syncStatus: true },
  });
  console.log(`\nTRANSCRIPTIONS (${rows.length} rows):`);
  for (const r of rows) {
    console.log(`  [${r.startMs}–${r.endMs}ms ${r.dialect} ${r.syncStatus}] (${r.text.length} chars) ${r.text.slice(0, 120)}`);
  }
} finally {
  await prisma.$disconnect();
}
