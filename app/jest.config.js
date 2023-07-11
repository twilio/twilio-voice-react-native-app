/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!@react-navigation|@react-native|react-native)',
  ],
  collectCoverage: true,
};

module.exports = config;
