/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverage: true,
};

module.exports = config;
