import { execSync } from 'child_process';

// Applies the committed migrations to the test database once before the whole
// suite. Uses the same `migrate deploy` path as production so tests exercise
// the real schema, not an ad-hoc `db push` shape.
export default function globalSetup(): void {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is required for the integration test suite.');
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
