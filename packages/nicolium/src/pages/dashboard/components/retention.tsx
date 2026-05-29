import React from 'react';
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl';

import { useRetention } from '@/queries/admin/use-metrics';

import type { AdminCohort } from 'pl-api';

const dateForCohort = (cohort: AdminCohort) => {
  const timeZone = 'UTC';
  switch (cohort.frequency) {
    case 'day':
      return <FormattedDate value={cohort.period} month='long' day='2-digit' timeZone={timeZone} />;
    default:
      return (
        <FormattedDate value={cohort.period} month='long' year='numeric' timeZone={timeZone} />
      );
  }
};

interface IRetention {
  startAt: string;
  endAt: string;
  frequency: 'day' | 'month';
}

const Retention: React.FC<IRetention> = ({ startAt, endAt, frequency }) => {
  const { data } = useRetention(startAt, endAt, frequency);

  let content;

  if (!data) {
    content = <FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' />;
  } else {
    content = (
      <table>
        <thead>
          <tr>
            <th>
              <div className='admin-retention-table__header-cell admin-retention-table__header-cell--first'>
                <FormattedMessage
                  id='admin.dashboard.retention.cohort'
                  defaultMessage='Sign-up month'
                />
              </div>
            </th>

            <th>
              <div className='admin-retention-table__header-cell'>
                <FormattedMessage
                  id='admin.dashboard.retention.cohort_size'
                  defaultMessage='New users'
                />
              </div>
            </th>

            {data[0].data.slice(1).map((retention, i) => (
              <th key={retention.date} className='admin-retention-table__th-narrow'>
                <div className='admin-retention-table__header-cell'>{i + 1}</div>
              </th>
            ))}
          </tr>

          <tr>
            <td>
              <div className='admin-retention-table__header-cell admin-retention-table__header-cell--first'>
                <FormattedMessage id='admin.dashboard.retention.average' defaultMessage='Average' />
              </div>
            </td>

            <td>
              <div className='admin-retention-table__cell admin-retention-table__cell--center'>
                <FormattedNumber
                  value={data.reduce(
                    (sum, cohort, i) => sum + (cohort.data[0].value * 1 - sum) / (i + 1),
                    0,
                  )}
                  maximumFractionDigits={0}
                />
              </div>
            </td>

            {data[0].data.slice(1).map((retention, i) => {
              const average = data.reduce(
                (sum, cohort, k) =>
                  cohort.data[i + 1] ? sum + (cohort.data[i + 1].rate - sum) / (k + 1) : sum,
                0,
              );

              return (
                <td key={retention.date}>
                  <div
                    className='admin-retention-table__cell admin-retention-table__cell--colored'
                    style={{ '--cell-opacity': 0.5 + average / 2 } as React.CSSProperties}
                  >
                    {/* eslint-disable-next-line react/style-prop-object */}
                    <FormattedNumber value={average} style='percent' />
                  </div>
                </td>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.slice(0, -1).map((cohort) => (
            <tr key={cohort.period}>
              <td>
                <div className='admin-retention-table__cell admin-retention-table__cell--first'>
                  {dateForCohort(cohort)}
                </div>
              </td>

              <td>
                <div className='admin-retention-table__cell admin-retention-table__cell--center'>
                  <FormattedNumber value={cohort.data[0].value} />
                </div>
              </td>

              {cohort.data.slice(1).map((retention) => (
                <td key={retention.date}>
                  <div
                    className='admin-retention-table__cell admin-retention-table__cell--colored'
                    style={{ '--cell-opacity': 0.5 + retention.rate / 2 } as React.CSSProperties}
                  >
                    {/* eslint-disable-next-line react/style-prop-object */}
                    <FormattedNumber value={retention.rate} style='percent' />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  let title = null;
  switch (frequency) {
    case 'day':
      title = (
        <FormattedMessage
          id='admin.dashboard.daily_retention'
          defaultMessage='User retention rate by day after sign-up'
        />
      );
      break;
    default:
      title = (
        <FormattedMessage
          id='admin.dashboard.monthly_retention'
          defaultMessage='User retention rate by month after sign-up'
        />
      );
  }

  return (
    <div className='admin-retention-table'>
      <p className='admin-retention-table__title'>{title}</p>

      {content}
    </div>
  );
};

export { Retention };
