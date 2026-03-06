import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Select from '@/components/ui/select';

const messages = defineMessages({
  daysTitle: { id: 'compose_form.poll.duration.days', defaultMessage: 'Days' },
  hoursTitle: { id: 'compose_form.poll.duration.hours', defaultMessage: 'Hours' },
  minutesTitle: { id: 'compose_form.poll.duration.minutes', defaultMessage: 'Minutes' },
});

interface IDurationSelector {
  onDurationChange(expiresIn: number): void;
  value: number;
}

const DurationSelector = ({ onDurationChange, value }: IDurationSelector) => {
  const intl = useIntl();

  const [days, setDays] = useState<number>(Math.floor(value / (24 * 60 * 60)));
  const [hours, setHours] = useState<number>(Math.floor((value % (24 * 60 * 60)) / (60 * 60)));
  const [minutes, setMinutes] = useState<number>(Math.floor((value % (60 * 60)) / 60));

  const newValue = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;

  useEffect(() => {
    if (days === 7) {
      setHours(0);
      setMinutes(0);
    }
  }, [days]);

  useEffect(() => {
    onDurationChange(newValue);
  }, [newValue]);

  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
      <div className='sm:col-span-1'>
        <Select
          value={days}
          onChange={(event) => {
            setDays(Number(event.target.value));
          }}
          data-testid='duration-selector-days'
          title={intl.formatMessage(messages.daysTitle)}
        >
          {[...Array(8).fill(undefined)].map((_, number) => (
            <option value={number} key={number}>
              <FormattedMessage
                id='intervals.full.days'
                defaultMessage='{number, plural, one {# day} other {# days}}'
                values={{ number }}
              />
            </option>
          ))}
        </Select>
      </div>

      <div className='sm:col-span-1'>
        <Select
          value={hours}
          onChange={(event) => {
            setHours(Number(event.target.value));
          }}
          disabled={days === 7}
          data-testid='duration-selector-hours'
          title={intl.formatMessage(messages.hoursTitle)}
        >
          {[...Array(24).fill(undefined)].map((_, number) => (
            <option value={number} key={number}>
              <FormattedMessage
                id='intervals.full.hours'
                defaultMessage='{number, plural, one {# hour} other {# hours}}'
                values={{ number }}
              />
            </option>
          ))}
        </Select>
      </div>

      <div className='sm:col-span-1'>
        <Select
          value={minutes}
          onChange={(event) => {
            setMinutes(Number(event.target.value));
          }}
          disabled={days === 7}
          data-testid='duration-selector-minutes'
          title={intl.formatMessage(messages.minutesTitle)}
        >
          {[0, 15, 30, 45].map((number) => (
            <option value={number} key={number}>
              <FormattedMessage
                id='intervals.full.minutes'
                defaultMessage='{number, plural, one {# minute} other {# minutes}}'
                values={{ number }}
              />
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export { DurationSelector as default };
