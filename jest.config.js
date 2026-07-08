const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path to your Next.js app — loads next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>'],
}

module.exports = createJestConfig(customJestConfig)