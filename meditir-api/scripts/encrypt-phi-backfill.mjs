// One-off, idempotent backfill: encrypts PHI rows written before encryption
// was enabled. Reading through the extended client returns plaintext
// (legacy passthrough); writing it straight back makes the extension
// encrypt it. Already-encrypted rows decrypt -> re-encrypt cleanly, so
// this is safe to re-run.
//
// Usage (with prod DATABASE_URL + PHI_ENCRYPTION_KEY set):
//   node scripts/encrypt-phi-backfill.mjs
//
// Not wired into the start path — run deliberately, ideally after a DB
// snapshot.

import { prisma, ENCRYPTED_FIELDS } from '../dist/config/database.js';

// model name -> prisma client accessor
const accessor = (m) => m.charAt(0).toLowerCase() + m.slice(1);
const BATCH = 200;

let total = 0;
for (const [model, fields] of Object.entries(ENCRYPTED_FIELDS)) {
  const delegate = prisma[accessor(model)];
  const count = await delegate.count();
  console.log(`[backfill] ${model}: ${count} rows`);
  for (let skip = 0; skip < count; skip += BATCH) {
    const rows = await delegate.findMany({ skip, take: BATCH });
    for (const row of rows) {
      const data = {};
      for (const f of fields) if (row[f] != null) data[f] = row[f]; // plaintext here
      if (Object.keys(data).length === 0) continue;
      await delegate.update({ where: { id: row.id }, data }); // extension encrypts
      total++;
    }
    console.log(`[backfill] ${model}: processed ${Math.min(skip + BATCH, count)}/${count}`);
  }
}
console.log(`[backfill] done — ${total} rows re-encrypted.`);
await prisma.$disconnect();
process.exit(0);
