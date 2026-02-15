import React from 'react';
import { FormattedNumber } from 'react-intl';

import Text from '@/components/ui/text';
import { useDimensions } from '@/queries/admin/use-metrics';

import type { AdminDimensionKey, AdminGetDimensionsParams } from 'pl-api';

interface IDimension {
  dimension: AdminDimensionKey;
  startAt: string;
  endAt: string;
  label?: JSX.Element;
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
      <table className='w-full'>
        <tbody>
          {data[0].data.map((item) => (
            <tr
              className='border-b border-primary-200 last:border-none dark:border-gray-800'
              key={item.key}
            >
              <td className='p-2.5'>
                <span
                  className='mr-2 inline-block size-2 rounded-full bg-green-500 shadow-sm'
                  style={{ opacity: +item.value / sum }}
                />
                <Text title={item.key} weight='medium' size='xs' tag='span'>
                  {item.human_key}
                </Text>
              </td>

              <td className='p-2.5 text-end'>
                <Text size='xs'>
                  {typeof item.human_value !== 'undefined' ? (
                    item.human_value
                  ) : (
                    <FormattedNumber value={+item.value} />
                  )}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      {label && (
        <Text
          className='border-b border-primary-200 pb-1 dark:border-gray-800'
          weight='medium'
          size='sm'
        >
          {label}
        </Text>
      )}

      {content}
    </div>
  );
};

export { Dimension };
