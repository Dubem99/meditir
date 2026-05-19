/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Populate required env before any module (config/index.ts) is imported.
  setupFiles: ['<rootDir>/tests/setup/env.ts'],
  // DB lifecycle: truncate between tests, disconnect at the end.
  setupFilesAfterEnv: ['<rootDir>/tests/setup/db-lifecycle.ts'],
  // Apply migrations to the test database once before the suite.
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  clearMocks: true,
};
