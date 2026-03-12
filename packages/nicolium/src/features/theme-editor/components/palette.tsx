import React, { useEffect, useState } from 'react';

import Slider from '@/components/ui/slider';
import { usePrevious } from '@/hooks/use-previous';
import { compareId } from '@/utils/comparators';
import { hueShift } from '@/utils/theme';

import Color from './color';

interface ColorGroup {
  [tint: string]: string;
}

interface IPalette {
  id?: string;
  palette: ColorGroup;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
  allowTintChange?: boolean;
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({
  id,
  palette,
  onChange,
  resetKey,
  allowTintChange = true,
}) => {
  const tints = Object.keys(palette).toSorted(compareId);

  const [hue, setHue] = useState(0);
  const lastHue = usePrevious(hue);

  const handleChange = (tint: string) => (color: string) => {
    onChange({
      ...palette,
      [tint]: color,
    });
  };

  useEffect(() => {
    const delta = hue - (lastHue ?? 0);

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
    <div className='flex w-full flex-col'>
      <div className='flex h-8 overflow-hidden rounded-md'>
        {tints.map((tint) => (
          <Color
            key={tint}
            color={palette[tint]}
            onChange={allowTintChange ? handleChange(tint) : undefined}
          />
        ))}
      </div>

      <Slider id={id} value={hue} onChange={setHue} />
    </div>
  );
};

export { Palette as default, ColorGroup };
