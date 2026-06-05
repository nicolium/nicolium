type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };
type Oklab = { L: number; a: number; b: number };

type ColorObject = {
  [key: number]: string;
};

type ColorPalette = {
  [key: string]: ColorObject | string | null;
};

export type { Rgb, Hsl, Oklab, ColorObject, ColorPalette };
