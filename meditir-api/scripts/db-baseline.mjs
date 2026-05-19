// Idempotent migration baseline guard. Makes `prisma migrate deploy` safe on
// every kind of database without any manual step:
//
//   * Fresh DB (no tables)            -> do nothing; migrate deploy creates all.
//   * Existing DB from old `db push`  -> adopt it: mark 0_init as already
//                                        applied so deploy doesn't try to
//                                        re-CREATE existing tables and crash.
//   * Already on migrations           -> do nothing; normal deploy.
//
// Runs before `prisma migrate deploy` in the container CMD / start script.

import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASELINE = '0_init';

const regclass = async (name) => {
  const r = await prisma.$queryRawUnsafe(`SELECT to_regclass('public.${name}') AS t`);
  return r?.[0]?.t != null;
};

try {
  const hasMigrationsTable = await regclass('_prisma_migrations');
  if (hasMigrationsTable) {
    console.log('[db-baseline] _prisma_migrations present — nothing to do.');
  } else {
    const hasSchema = await regclass('hospitals'); // stable core table
    if (hasSchema) {
      console.log(
        `[db-baseline] Existing schema with no migration history — adopting baseline ${BASELINE}.`,
      );
      execSync(`npx prisma migrate resolve --applied ${BASELINE}`, { stdio: 'inherit' });
      console.log('[db-baseline] Baseline adopted.');
    } else {
      console.log('[db-baseline] Fresh database — migrate deploy will create the schema.');
    }
  }
} catch (err) {
  console.error('[db-baseline] FAILED:', err?.message ?? err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
