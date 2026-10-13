// Adapted from react-native-bottom-tabs
// Licensed under MIT license
// https://github.com/callstack/react-native-bottom-tabs/blob/main/packages/react-native-bottom-tabs/src/expo.ts

import { type ConfigPlugin, withAndroidStyles, withAppBuildGradle } from 'expo/config-plugins';

const MATERIAL3_THEME_DYNAMIC = 'Theme.Material3.DynamicColors.DayNight.NoActionBar';
const MATERIAL3_THEME = 'Theme.Material3.DayNight.NoActionBar';
const MATERIAL2_THEME = 'Theme.MaterialComponents.DayNight.NoActionBar';
const MATERIAL3_EXPRESSIVE_THEME = 'Theme.Material3Expressive.DayNight.NoActionBar';

const MATERIAL_DEPENDENCY = "implementation 'com.google.android.material:material:1.14.0'";

type ConfigProps = {
  /*
   * Define theme that should be used.
   * @default 'material3'(i)
   */
  theme: 'material2' | 'material3' | 'material3-dynamic' | 'material3-expressive';
};

const withMaterial3Theme: ConfigPlugin<ConfigProps> = (config, options) => {
  const theme = options?.theme;

  if (theme === 'material3-expressive') {
    config = withAppBuildGradle(config, (gradleConfig) => {
      if (!gradleConfig.modResults.contents.includes('com.google.android.material:material')) {
        gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
          /dependencies\s*{/,
          (match) => `${match}\n    ${MATERIAL_DEPENDENCY}`,
        );
      }
      return gradleConfig;
    });
  }

  return withAndroidStyles(config, (stylesConfig) => {
    stylesConfig.modResults.resources.style = stylesConfig.modResults.resources.style?.map(
      (style) => {
        if (style.$.name === 'AppTheme') {
          if (theme === 'material3-dynamic') {
            style.$.parent = MATERIAL3_THEME_DYNAMIC;
          } else if (theme === 'material2') {
            style.$.parent = MATERIAL2_THEME;
          } else if (theme === 'material3-expressive') {
            style.$.parent = MATERIAL3_EXPRESSIVE_THEME;
          } else {
            style.$.parent = MATERIAL3_THEME;
          }
        }

        return style;
      },
    );

    return stylesConfig;
  });
};

export default withMaterial3Theme;
