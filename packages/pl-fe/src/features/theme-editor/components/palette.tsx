import React, { useEffect, useState } from 'react';

import HStack from '@/components/ui/hstack';
import Slider from '@/components/ui/slider';
import Stack from '@/components/ui/stack';
import { usePrevious } from '@/hooks/use-previous';
import { compareId } from '@/utils/comparators';
import { hueShift } from '@/utils/theme';

import Color from './color';

interface ColorGroup {
  [tint: string]: string;
}

interface IPalette {
  palette: ColorGroup;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
  allowTintChange?: boolean;
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({ palette, onChange, resetKey, allowTintChange = true }) => {
  const tints = Object.keys(palette).sort(compareId);

  const [hue, setHue] = useState(0);
  const lastHue = usePrevious(hue);

  const handleChange = (tint: string) => (color: string) => {
    onChange({
      ...palette,
      [tint]: color,
    });
  };

  useEffect(() => {
    const delta = hue - (lastHue || 0);

    const adjusted = Object.entries(palette).reduce<ColorGroup>((result, [tint, hex]) => {
      result[tint] = hueShift(hex, delta * 360);
      return result;
    }, {});

    onChange(adjusted);
  }, [hue]);

  useEffect(() => {
    setHue(0);
  }, [resetKey]);

  return (
    <Stack className='w-full'>
      <HStack className='h-8 overflow-hidden rounded-md'>
        {tints.map(tint => (
          <Color key={tint} color={palette[tint]} onChange={allowTintChange ? handleChange(tint) : undefined} />
        ))}
      </HStack>

      <Slider value={hue} onChange={setHue} />
    </Stack>
  );
};

export {
  Palette as default,
  ColorGroup,
};
