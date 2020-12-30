module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/infra'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
