import tintify from '@/utils/colors';
import { generateAccent, generateNeutral } from '@/utils/theme';

import type { ColorPalette } from '@/types/colors';

type FrontendColors = Record<string, Record<string, string>>;

/** Check if the value is a valid hex color */
const isHex = (value: any): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(value);

/** Expand hex colors into tints */
const expandPalette = (palette: ColorPalette): ColorPalette =>
  // Generate palette only for present colors
  Object.entries(palette).reduce((result: ColorPalette, colorData) => {
    const [colorName, color] = colorData;

    // Conditionally handle hex color and color object
    if (typeof color === 'string' && isHex(color)) {
      result[colorName] = tintify(color);
    } else if (color && typeof color === 'object') {
      result[colorName] = color;
    }

    return result;
  }, {});

// Generate accent color only if brandColor is present
const maybeGenerateAccentColor = (brandColor: string): string | null =>
  isHex(brandColor) ? generateAccent(brandColor) : null;

/** Build a color object from legacy colors */
const fromBasicColors = ({
  brandColor,
  accentColor,
}: {
  brandColor: string;
  accentColor: string | null;
}): ColorPalette => {
  const accent =
    typeof accentColor === 'string' && isHex(accentColor)
      ? accentColor
      : maybeGenerateAccentColor(brandColor);

  return expandPalette({
    primary: isHex(brandColor) ? brandColor : null,
    secondary: accent,
    accent,
    gray: isHex(brandColor) ? generateNeutral(brandColor) : null,
  });
};

/** Convert Nicolium Config into a color palette */
const toPalette = (config: {
  brandColor: string;
  accentColor: string | null;
  colors: Record<string, Record<string, string>>;
}): Record<string, Record<string, string> | string> => {
  const colors: FrontendColors = config.colors;
  const basicColors = fromBasicColors(config);

  return {
    ...colors,
    ...Object.fromEntries(
      Object.entries(basicColors).map(([key, value]) => [
        key,
        typeof value === 'string' ? colors[key] || value : { ...value, ...colors[key] },
      ]),
    ),
  };
};

export { toPalette };
