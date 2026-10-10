const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Make react-native-paper-select use the fork instead of upstream react-native-paper
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (
    (moduleName === 'react-native-paper' || moduleName.startsWith('react-native-paper/')) &&
    /[\\/]react-native-paper-select[\\/]/.test(context.originModulePath)
  ) {
    return resolve(
      context,
      moduleName.replace(/^react-native-paper/, '@mkljczk/react-native-paper'),
      platform,
    );
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
