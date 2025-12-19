import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedNumber } from 'react-intl';
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import Text from 'pl-fe/components/ui/text';
import { useMeasures } from 'pl-fe/queries/admin/use-metrics';

import type { AdminGetMeasuresParams, AdminMeasureKey } from 'pl-api';

const percIncrease = (a: number, b: number) => {
  let percent;

  if (b !== 0) {
    if (a !== 0) {
      percent = (b - a) / a;
    } else {
      percent = 1;
    }
  } else if (b === 0 && a === 0) {
    percent = 0;
  } else {
    percent = -1;
  }

  return percent;
};

interface ICounter {
  measure: AdminMeasureKey;
  startAt: string;
  endAt: string;
  label: JSX.Element | string;
  to?: string;
  params?: AdminGetMeasuresParams;
  target?: string;
}

const Counter: React.FC<ICounter> = ({
  measure,
  startAt,
  endAt,
  label,
  to,
  params,
  target,
}) => {
  const { data } = useMeasures([measure], startAt, endAt, params);

  let content;

  if (!data) {
    content = (
      <>
        {/* <span className='sparkline__value__total'><Skeleton width={43} /></span>
        <span className='sparkline__value__change'><Skeleton width={43} /></span> */}
      </>
    );
  } else {
    const measure = data![0];
    const percentChange = measure.previous_total !== undefined && percIncrease(measure.previous_total * 1, measure.total * 1) || 0;

    content = (
      <>
        <Text tag='span' align='center' size='2xl' weight='medium'>{measure.human_value || <FormattedNumber value={measure.total} />}</Text>
        {measure.previous_total !== undefined && (<span className={clsx('text-lg', { 'text-green-600': percentChange > 0, 'text-danger-600': percentChange < 0 })}>{percentChange > 0 && '+'}<FormattedNumber value={percentChange} style='percent' /></span>)}
      </>
    );
  }

  const inner = (
    <>
      <div className='flex items-end justify-center gap-2.5 px-5 pb-2 pt-4 leading-[33px]'>
        {content}
      </div>

      <Text align='center'>
        {label}
      </Text>

      <div className='mt-auto'>
        <Sparklines width={259} height={55} data={data?.[0].data.map(x => x.value * 1) || []}>
          <SparklinesCurve />
        </Sparklines>
      </div>
    </>
  );

  const className = 'relative flex flex-col rounded bg-gray-200 font-medium dark:bg-gray-800';

  if (to) {
    return (
      <Link to={to} className={clsx(className, 'transition-transform hover:-translate-y-1')} target={target}>
        {inner}
      </Link>
    );
  } else {
    return (
      <div className={className}>
        {inner}
      </div>
    );
  }
};

export { Counter };
