type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

type ColorObject = {
  [key: number]: string;
};

type ColorPalette = {
  [key: string]: ColorObject | string | null;
};

export type { Rgb, Hsl, ColorObject, ColorPalette };
