import React from 'react';
import { FormattedNumber } from 'react-intl';

/** Check if a value is REALLY a number. */
const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);

const roundDown = (num: number) => {
  if (num >= 100 && num < 1000) {
    num = Math.floor(num);
  }

  const n = Number(num.toFixed(2));
  return n > num ? n - 1 / Math.pow(10, 2) : n;
};

/** Display a number nicely for the UI, eg 1000 becomes 1K. */
const shortNumberFormat = (number: any, max?: number): React.ReactNode => {
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
    return <span>{max}+</span>;
  }

  return (
    <span>
      <FormattedNumber
        value={value}
        maximumFractionDigits={0}
        minimumFractionDigits={0}
        maximumSignificantDigits={3}
        numberingSystem='latn'
        // eslint-disable-next-line react/style-prop-object
        style='decimal'
      />
      {factor}
    </span>
  );
};

export { isNumber, roundDown, shortNumberFormat };
