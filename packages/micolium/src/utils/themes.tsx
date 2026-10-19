import { DarkTheme, LightTheme, adaptNavigationTheme } from '@mkljczk/react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';

import type { TypescaleStyle } from '@mkljczk/react-native-paper/lib/typescript/src/theme/types';

const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = merge(LightTheme, AdaptedLightTheme);
const CombinedDarkTheme = merge(DarkTheme, AdaptedDarkTheme);

const multiplyFontSizes = (typescaleStyle: TypescaleStyle, multiplier: number) =>
  multiplier === 1
    ? typescaleStyle
    : {
        ...typescaleStyle,
        fontSize: typescaleStyle.fontSize * multiplier,
        lineHeight: typescaleStyle.lineHeight * multiplier,
      };

const getSegmentedMenuStyles = (
  { colors }: typeof LightTheme,
  active: boolean,
  index: number,
  length: number,
) => {
  return {
    backgroundColor: active ? colors.secondaryContainer : colors.surfaceContainerHigh,
    borderTopLeftRadius: index === 0 ? 16 : 4,
    borderTopRightRadius: index === 0 ? 16 : 4,
    borderBottomLeftRadius: index === length - 1 ? 16 : 4,
    borderBottomRightRadius: index === length - 1 ? 16 : 4,
  };
};

export {
  CombinedLightTheme as LightTheme,
  CombinedDarkTheme as DarkTheme,
  multiplyFontSizes,
  getSegmentedMenuStyles,
};
