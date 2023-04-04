module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['coverage/'],
  globals: {
    globalThis: false, // false denotes not-writable
  },
  rules: {
    'no-shadow': 'error',
  },
};
