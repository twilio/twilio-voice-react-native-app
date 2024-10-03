const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

/**
 * Metro configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts:
      process.env.MY_APP_MODE === 'mocked'
        ? ['mock.ts', ...defaultSourceExts]
        : defaultSourceExts,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
