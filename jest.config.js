const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFiles: [
    "<rootDir>/dotenv-config.js"
  ],
  testEnvironment: 'node',
  testMatch: [
    "<rootDir>/**/*test.js",
    "<rootDir>/**/*test.ts"
  ],
  verbose: true
}

module.exports = createJestConfig(customJestConfig)