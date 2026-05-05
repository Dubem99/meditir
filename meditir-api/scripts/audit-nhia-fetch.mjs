// Pulls the last 7 days of NHIA billing codes (with SOAP + order context) from
// the production database, plus the canonical NHIA catalog, and prints a
// markdown-formatted bundle to stdout. Consumed by audit-nhia-weekly.ps1,
// which pipes it into `claude -p` for the actual accuracy audit.
//
// The connection string is read from AUDIT_DATABASE_URL so the wrapper script
// can inject DATABASE_PUBLIC_URL fetched from Railway without touching the
// project's normal DATABASE_URL.
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const dbUrl = process.env.AUDIT_DATABASE_URL;
if (!dbUrl) {
  console.error('AUDIT_DATABASE_URL is not set');
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: dbUrl });

try {
  const rows = await prisma.$queryRaw`
    SELECT bc.id, bc.code, bc.description, bc."tariffNgn", bc.source,
           bc."problemId", bc."orderId",
           o.name AS order_name, o.type AS order_type, o.instructions,
           sn.assessment, sn.plan
    FROM billing_codes bc
    LEFT JOIN orders o ON o.id = bc."orderId"
    LEFT JOIN soap_notes sn ON sn.id = bc."soapNoteId"
    WHERE bc."codeType" = 'NHIA'
      AND bc."createdAt" > NOW() - INTERVAL '7 days'
    ORDER BY bc."createdAt" DESC
    LIMIT 20;
  `;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const catalogPath = resolve(__dirname, '..', 'src', 'data', 'nhia-tariff.ts');
  const catalog = readFileSync(catalogPath, 'utf8');

  const totals = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE source = 'AI_EXTRACTED')::int AS ai_emitted,
      COUNT(*) FILTER (WHERE source = 'DOCTOR_ADDED')::int AS doctor_added,
      COUNT(*) FILTER (WHERE source = 'DOCTOR_EDITED')::int AS doctor_edited
    FROM billing_codes
    WHERE "codeType" = 'NHIA'
      AND "createdAt" > NOW() - INTERVAL '7 days';
  `;

  process.stdout.write('## Window totals (last 7 days, all NHIA codes)\n');
  process.stdout.write('```json\n');
  process.stdout.write(JSON.stringify(totals[0] ?? {}, null, 2));
  process.stdout.write('\n```\n\n');

  process.stdout.write(`## Sampled rows (up to 20, ordered by createdAt DESC)\n`);
  process.stdout.write('```json\n');
  process.stdout.write(JSON.stringify(rows, null, 2));
  process.stdout.write('\n```\n\n');

  process.stdout.write('## Canonical catalog (meditir-api/src/data/nhia-tariff.ts)\n');
  process.stdout.write('```typescript\n');
  process.stdout.write(catalog);
  process.stdout.write('\n```\n');
} finally {
  await prisma.$disconnect();
}
