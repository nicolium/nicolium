import React from 'react';
import { FormattedNumber } from 'react-intl';

import { useDimensions } from '@/queries/admin/use-metrics';

import type { AdminDimensionKey, AdminGetDimensionsParams } from 'pl-api';

interface IDimension {
  dimension: AdminDimensionKey;
  startAt: string;
  endAt: string;
  label?: React.JSX.Element;
  params: AdminGetDimensionsParams;
}

const Dimension: React.FC<IDimension> = ({ dimension, startAt, endAt, label, params }) => {
  const { data } = useDimensions([dimension], { ...params, start_at: startAt, end_at: endAt });

  let content;

  if (!data) {
    content = (
      <table>
        <tbody>
          {Array.from(Array(params.limit)).map((_, i) => (
            <tr key={i}>
              <td>{/* <Skeleton width={100} /> */}</td>

              <td>{/* <Skeleton width={60} /> */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    const sum = data[0].data.reduce((sum, cur) => sum + +cur.value * 1, 0);

    content = (
      <table className='admin-dimension-table__table'>
        <tbody>
          {data[0].data.map((item) => (
            <tr className='admin-dimension-table__row' key={item.key}>
              <td className='admin-dimension-table__key'>
                <span
                  className='admin-dimension-table__dot'
                  style={{ opacity: +item.value / sum }}
                />
                <span title={item.key}>{item.human_key}</span>
              </td>

              <td className='admin-dimension-table__value'>
                <span>
                  {typeof item.human_value !== 'undefined' ? (
                    item.human_value
                  ) : (
                    <FormattedNumber value={+item.value} />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className='admin-dimension-table'>
      {label && <p className='admin-dimension-table__label'>{label}</p>}

      {content}
    </div>
  );
};

export { Dimension };
