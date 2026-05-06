import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedNumber } from 'react-intl';
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import { useMeasures } from '@/queries/admin/use-metrics';

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

type ICounter = {
  measure: AdminMeasureKey;
  startAt: string;
  endAt: string;
  label: React.JSX.Element | string;
  params?: AdminGetMeasuresParams;
  target?: string;
} & (LinkOptions | {});

const Counter: React.FC<ICounter> = ({
  measure,
  startAt,
  endAt,
  label,
  params,
  target,
  ...rest
}) => {
  const { data } = useMeasures([measure], startAt, endAt, params);

  let content;

  if (!data) {
    content = null;
  } else {
    const measure = data[0];
    const percentChange =
      (measure.previous_total !== undefined &&
        percIncrease(measure.previous_total * 1, measure.total * 1)) ||
      0;

    content = (
      <>
        <span className='⁂-measure__total'>
          {measure.human_value ?? <FormattedNumber value={measure.total} />}
        </span>
        {measure.previous_total !== undefined && (
          <span
            className={clsx('⁂-measure__previous', {
              '⁂-measure__previous--negative': percentChange < 0,
            })}
          >
            {percentChange > 0 && '+'}
            {/* eslint-disable-next-line react/style-prop-object */}
            <FormattedNumber value={percentChange} style='percent' />
          </span>
        )}
      </>
    );
  }

  const inner = (
    <>
      <div className='⁂-measure'>{content}</div>

      <p className='⁂-measure__label'>{label}</p>

      <div className='⁂-measure__sparklines'>
        <Sparklines width={259} height={55} data={data?.[0].data.map((x) => x.value * 1) ?? []}>
          <SparklinesCurve />
        </Sparklines>
      </div>
    </>
  );

  if ('to' in rest) {
    return (
      <Link {...rest} className='⁂-measure__container' target={target}>
        {inner}
      </Link>
    );
  } else {
    return <div className='⁂-measure__container'>{inner}</div>;
  }
};

export { Counter };
