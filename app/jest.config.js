/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  preset: 'react-native',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};

module.exports = config;
