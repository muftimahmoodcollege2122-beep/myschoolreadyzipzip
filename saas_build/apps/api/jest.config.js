module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\.spec\.ts$',
  transform: { '^.+\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.module.ts', '!src/main.ts'],
  coverageDirectory: './coverage',
  coverageThreshold: { global: { branches: 60, functions: 70, lines: 70, statements: 70 } },
  testEnvironment: 'node',
  moduleNameMapper: { '^@app/(.*)$': '<rootDir>/src/$1' },
};
