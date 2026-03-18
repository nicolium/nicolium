import React from 'react';
import { FormattedDate } from 'react-intl';

import Icon from '@/components/icon';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

interface IEventDate {
  status: Pick<Status, 'event'>;
}

const EventDate: React.FC<IEventDate> = ({ status }) => {
  const event = status.event!;

  if (!event.start_time) return null;

  const startDate = new Date(event.start_time);

  let date;

  if (event.end_time) {
    const endDate = new Date(event.end_time);

    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const sameDay =
      startDate.getDate() === endDate.getDate() &&
      startDate.getMonth() === endDate.getMonth() &&
      sameYear;

    if (sameDay) {
      date = (
        <>
          <FormattedDate
            value={event.start_time}
            year={sameYear ? undefined : '2-digit'}
            month='short'
            day='2-digit'
            weekday='short'
            hour='2-digit'
            minute='2-digit'
          />
          {' - '}
          <FormattedDate value={event.end_time} hour='2-digit' minute='2-digit' />
        </>
      );
    } else {
      date = (
        <>
          <FormattedDate
            value={event.start_time}
            year='2-digit'
            month='short'
            day='2-digit'
            weekday='short'
          />
          {' - '}
          <FormattedDate
            value={event.end_time}
            year='2-digit'
            month='short'
            day='2-digit'
            weekday='short'
          />
        </>
      );
    }
  } else {
    date = (
      <FormattedDate
        value={event.start_time}
        year='2-digit'
        month='short'
        day='2-digit'
        weekday='short'
        hour='2-digit'
        minute='2-digit'
      />
    );
  }

  return (
    <div className='⁂-event-date'>
      <Icon src={require('@phosphor-icons/core/regular/calendar-dots.svg')} />
      <span>{date}</span>
    </div>
  );
};

export { EventDate as default };
