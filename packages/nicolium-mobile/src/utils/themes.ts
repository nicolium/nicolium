import { DarkTheme, LightTheme, adaptNavigationTheme } from '@mkljczk/react-native-paper';
import { TypescaleStyle } from '@mkljczk/react-native-paper/lib/typescript/src/theme/types';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';

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

export { CombinedLightTheme as LightTheme, CombinedDarkTheme as DarkTheme, multiplyFontSizes };
