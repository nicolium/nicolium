import { Link, type LinkOptions } from '@tanstack/react-router';
import React from 'react';
import { FormattedNumber } from 'react-intl';

import Text from 'pl-fe/components/ui/text';
import { isNumber } from 'pl-fe/utils/numbers';

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

  const className = 'flex cursor-pointer flex-col items-center space-y-2 rounded bg-gray-200 p-4 transition-transform hover:-translate-y-1 dark:bg-gray-800';

  const body = (
    <>
      <Text align='center' size='2xl' weight='medium'>
        <FormattedNumber
          value={count}
          style={percent ? 'unit' : undefined}
          unit={percent ? 'percent' : undefined}
          numberingSystem='latn'
        />
      </Text>
      <Text align='center'>
        {label}
      </Text>
    </>
  );

  if (!('to' in rest)) {
    return <span className={className}>{body}</span>;
  }

  return (
    <Link className={className} {...rest}>
      {body}
    </Link>
  );
};

interface IDashCounters {
  children: React.ReactNode;
}

/** Wrapper container for dash counters. */
const DashCounters: React.FC<IDashCounters> = ({ children }) => (
  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
    {children}
  </div>
);

export {
  DashCounter,
  DashCounters,
};
