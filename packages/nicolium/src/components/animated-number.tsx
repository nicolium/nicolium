import { animated, config, useTransition } from '@react-spring/web';
import React, { useEffect, useState } from 'react';
import { useIntl, type IntlShape } from 'react-intl';

import { useSettings } from '@/stores/settings';
import { isNumber, roundDown } from '@/utils/numbers';

const obfuscatedCount = (count: number): string => {
  if (count < 0) {
    return '0';
  } else if (count <= 1) {
    return count.toString();
  } else {
    return '1+';
  }
};

const shortNumberFormat = (number: number, intl: IntlShape, max?: number) => {
  if (!isNumber(number)) return '•';

  let value = number;
  let factor: string = '';
  if (number >= 1000 && number < 1000000) {
    factor = 'k';
    value = roundDown(value / 1000);
  } else if (number >= 1000000) {
    factor = 'M';
    value = roundDown(value / 1000000);
  }

  if (max && value > max) {
    return `${max}+`;
  }

  return (
    intl.formatNumber(value, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      maximumSignificantDigits: 3,
      numberingSystem: 'latn',
      style: 'decimal',
    }) + factor
  );
};

interface IAnimatedNumber {
  value: number;
  obfuscate?: boolean;
  short?: boolean;
  max?: number;
}

const AnimatedNumber: React.FC<IAnimatedNumber> = ({ value, obfuscate, short, max }) => {
  const intl = useIntl();
  const { reduceMotion } = useSettings();

  const [direction, setDirection] = useState(0);
  const [displayedValue, setDisplayedValue] = useState<number>(value);
  const [formattedValue, setFormattedValue] = useState<string>(
    intl.formatNumber(value, { numberingSystem: 'latn' }),
  );

  useEffect(() => {
    if (displayedValue !== undefined) {
      if (value > displayedValue) setDirection(1);
      else if (value < displayedValue) setDirection(-1);
    }

    setDisplayedValue(value);
    setFormattedValue(
      obfuscate
        ? obfuscatedCount(value)
        : short
          ? shortNumberFormat(value, intl, max)
          : intl.formatNumber(value, { numberingSystem: 'latn' }),
    );
  }, [value, intl, max, obfuscate, short]);

  const transitions = useTransition(formattedValue, {
    from: { y: -1 * direction },
    enter: { y: 0 },
    leave: { y: 1 * direction },
    config: config.slow,
    immediate: reduceMotion || direction === 0,
  });

  if (reduceMotion) {
    return formattedValue;
  }

  return (
    <span className='⁂-animated-number'>
      {transitions((style, item) => (
        <animated.span
          key={item}
          style={{
            position: item === formattedValue ? 'static' : 'absolute',
            transform: style.y.to((y) => `translateY(${y * 100}%)`),
          }}
        >
          {item}
        </animated.span>
      ))}
    </span>
  );
};

export { AnimatedNumber as default };
