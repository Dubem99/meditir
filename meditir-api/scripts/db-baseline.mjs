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

// Cast regclass -> text; Prisma cannot deserialize the raw `regclass` type.
const regclass = async (name) => {
  const r = await prisma.$queryRawUnsafe(`SELECT to_regclass('public.${name}')::text AS t`);
  return r?.[0]?.t != null;
};

// Use the locally-installed prisma CLI and never let npx attempt a network
// install (which hangs silently in a locked-down container until the
// healthcheck times out). Fail fast instead.
const prismaCli = (args) =>
  execSync(`npx --no-install prisma ${args}`, { stdio: 'inherit' });

try {
  const hasMigrationsTable = await regclass('_prisma_migrations');
  if (hasMigrationsTable) {
    console.log('[db-baseline] _prisma_migrations present — nothing to adopt.');
  } else {
    const hasSchema = await regclass('hospitals'); // stable core table
    if (hasSchema) {
      console.log(
        `[db-baseline] Existing schema with no migration history — adopting baseline ${BASELINE}.`,
      );
      prismaCli(`migrate resolve --applied ${BASELINE}`);
      console.log('[db-baseline] Baseline adopted.');
    } else {
      console.log('[db-baseline] Fresh database — migrate deploy will create the schema.');
    }
  }

  // Disconnect before the migrate engine runs so no session lingers.
  await prisma.$disconnect();

  console.log('[db-baseline] Running prisma migrate deploy...');
  prismaCli('migrate deploy');
  console.log('[db-baseline] migrate deploy complete. Handing off to server.');
  // Explicit: the Prisma engine can keep the event loop alive after
  // $disconnect, so the process would otherwise hang here and the start
  // chain (`&& node dist/server.js`) would never run.
  process.exit(0);
} catch (err) {
  console.error('[db-baseline] FAILED:', err?.message ?? err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
}
