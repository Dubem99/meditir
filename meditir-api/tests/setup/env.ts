// Runs before any application module is imported. config/index.ts validates
// env at import time and process.exit(1)s on failure, so the required vars
// must exist here. Integration tests hit a real Postgres given by
// TEST_DATABASE_URL (set by CI or the developer); never the dev/prod DB.

const testDbUrl = process.env.TEST_DATABASE_URL;
if (!testDbUrl) {
  throw new Error(
    'TEST_DATABASE_URL is required to run integration tests. ' +
      'Point it at a throwaway Postgres database, e.g. ' +
      'postgresql://postgres:postgres@localhost:5432/meditir_test',
  );
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDbUrl;
process.env.JWT_ACCESS_SECRET ??= 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET ??= 'test_refresh_secret_at_least_32_characters_long';
process.env.COOKIE_SECRET ??= 'test_cookie_secret_min_16';
process.env.ANTHROPIC_API_KEY ??= 'sk-ant-test-key';
process.env.ALLOWED_ORIGINS ??= 'http://localhost:3000';
process.env.LOG_LEVEL ??= 'error';
