const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path to your Next.js app — loads next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>'],
  // e2e/*.spec.js are Playwright tests (run via `npm run test:e2e`), not
  // Jest - Jest's default testMatch would otherwise also pick them up and
  // fail to load them (Playwright's test/expect globals aren't Jest's).
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
}

module.exports = createJestConfig(customJestConfig)