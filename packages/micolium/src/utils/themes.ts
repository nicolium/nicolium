import { argbFromHex, CorePalette, hexFromArgb } from '@material/material-color-utilities';
import { DarkTheme, LightTheme, Palette, adaptNavigationTheme } from '@mkljczk/react-native-paper';
import { buildScheme } from '@mkljczk/react-native-paper/src/theme/tokens/sys/color';
import { getMaterial3Theme, isDynamicThemeSupported } from '@pchmn/expo-material3-theme';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';
import React from 'react';
import { useColorScheme, type ColorSchemeName, type StyleProp, type ViewStyle } from 'react-native';

import { useSetting } from '@/stores/settings';

import type {
  ThemeColors,
  TypescaleStyle,
} from '@mkljczk/react-native-paper/lib/typescript/src/theme/types';

const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = merge(LightTheme, AdaptedLightTheme);
const CombinedDarkTheme = merge(DarkTheme, AdaptedDarkTheme);

const createPalette = (sourceColor: string) => {
  const { a1, a2, a3, n1, n2, error } = CorePalette.of(argbFromHex(sourceColor));
  const palettes = {
    primary: a1,
    secondary: a2,
    tertiary: a3,
    neutral: n1,
    neutralVariant: n2,
    error,
  };

  return Object.fromEntries(
    Object.keys(Palette).map((key) => {
      const [, name, tone] = key.match(/^(\D+)(\d+)$/u)!;
      return [key, hexFromArgb(palettes[name as keyof typeof palettes].tone(Number(tone)))];
    }),
  ) as typeof Palette;
};

const darkTheme = {
  ...CombinedDarkTheme,
  shapes: {
    ...CombinedDarkTheme.shapes,
    corner: {
      ...CombinedDarkTheme.shapes.corner,
      extraLarge: CombinedDarkTheme.shapes.corner.medium,
    },
  },
};

const lightTheme = {
  ...CombinedLightTheme,
  shapes: {
    ...CombinedLightTheme.shapes,
    corner: {
      ...CombinedLightTheme.shapes.corner,
      extraLarge: CombinedLightTheme.shapes.corner.medium,
    },
  },
};

const BLACK_OVERRIDE = { surface: '#000', surfaceContainer: '#000', background: '#000' };

const useTheme = (colorScheme?: ColorSchemeName) => {
  const sourceColor = useSetting('appearance.sourceColor');
  const contrast = useSetting('appearance.contrast');

  const systemColorScheme = useColorScheme();
  const theme = React.useMemo(() => {
    const theme = getMaterial3Theme(sourceColor.slice(0, 7));
    if (contrast === 'standard') return theme;

    const palette = createPalette(
      isDynamicThemeSupported ? theme.light.primary : sourceColor.slice(0, 7),
    );

    return {
      light: { ...theme.light, ...buildScheme(palette, { mode: 'light', contrast }) },
      dark: { ...theme.dark, ...buildScheme(palette, { mode: 'dark', contrast }) },
    };
  }, [sourceColor, contrast]);
  const darkOverrides = useSetting('appearance.black') ? BLACK_OVERRIDE : {};

  return (colorScheme ?? systemColorScheme) === 'dark'
    ? { ...darkTheme, colors: { ...theme.dark, ...darkOverrides } }
    : { ...lightTheme, colors: theme.light };
};

const multiplyFontSizes = (typescaleStyle: TypescaleStyle, multiplier: number) =>
  multiplier === 1
    ? typescaleStyle
    : {
        ...typescaleStyle,
        fontSize: typescaleStyle.fontSize * multiplier,
        lineHeight: typescaleStyle.lineHeight * multiplier,
      };

type SurfaceColorVariant = 'normal' | 'lowest' | 'low' | 'high' | 'highest';

const getColorVariant = (variant: SurfaceColorVariant): Exclude<keyof ThemeColors, 'elevation'> => {
  switch (variant) {
    case 'normal':
      return 'surfaceContainer';
    case 'lowest':
      return 'surfaceContainerLowest';
    case 'low':
      return 'surfaceContainerLow';
    case 'high':
      return 'surfaceContainerHigh';
    case 'highest':
      return 'surfaceContainerHighest';
  }
};

const getSegmentedMenuStyles = (
  { colors }: typeof LightTheme,
  active: boolean,
  index: number,
  length: number,
  variant: SurfaceColorVariant = 'high',
): StyleProp<ViewStyle> => ({
  backgroundColor: active ? colors.secondaryContainer : colors[getColorVariant(variant)],
  borderTopLeftRadius: index === 0 ? 16 : 4,
  borderTopRightRadius: index === 0 ? 16 : 4,
  borderBottomLeftRadius: index === length - 1 ? 16 : 4,
  borderBottomRightRadius: index === length - 1 ? 16 : 4,
  overflow: 'hidden',
});

export {
  CombinedLightTheme as LightTheme,
  CombinedDarkTheme as DarkTheme,
  createPalette,
  multiplyFontSizes,
  getSegmentedMenuStyles,
  useTheme,
  type SurfaceColorVariant,
};
