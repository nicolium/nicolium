import { Link, type LinkOptions } from '@tanstack/react-router';
import React from 'react';
import { FormattedNumber } from 'react-intl';

import { isNumber } from '@/utils/numbers';

type IDashCounter = {
  count: number | undefined;
  label: React.ReactNode;
  percent?: boolean;
} & (LinkOptions | {});

/** Displays a (potentially clickable) dashboard statistic. */
const DashCounter: React.FC<IDashCounter> = ({ count, label, percent = false, ...rest }) => {
  if (!isNumber(count)) {
    return null;
  }

  const body = (
    <>
      <p className='dashcounter__number'>
        <FormattedNumber
          value={count}
          style={percent ? 'unit' : undefined}
          unit={percent ? 'percent' : undefined}
          numberingSystem='latn'
        />
      </p>
      <p className='dashcounter__label'>{label}</p>
    </>
  );

  if (!('to' in rest)) {
    return <span className='dashcounter'>{body}</span>;
  }

  return (
    <Link className='dashcounter' {...rest}>
      {body}
    </Link>
  );
};

interface IDashCounters {
  children: React.ReactNode;
}

/** Wrapper container for dash counters. */
const DashCounters: React.FC<IDashCounters> = ({ children }) => (
  <div className='dashboard__counters'>{children}</div>
);

export { DashCounter, DashCounters };
