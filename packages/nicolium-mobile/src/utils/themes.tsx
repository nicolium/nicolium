import { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
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

const MicoliumBottomSheetBackdrop: React.FC<BottomSheetBackdropProps> = (props) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
);

const multiplyFontSizes = (typescaleStyle: TypescaleStyle, multiplier: number) =>
  multiplier === 1
    ? typescaleStyle
    : {
        ...typescaleStyle,
        fontSize: typescaleStyle.fontSize * multiplier,
        lineHeight: typescaleStyle.lineHeight * multiplier,
      };

export {
  CombinedLightTheme as LightTheme,
  CombinedDarkTheme as DarkTheme,
  MicoliumBottomSheetBackdrop as BottomSheetBackdrop,
  multiplyFontSizes,
};
