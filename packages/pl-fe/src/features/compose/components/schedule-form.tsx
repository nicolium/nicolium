import clsx from 'clsx';
import React, { Suspense, useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setSchedule, removeSchedule } from '@/actions/compose';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import { DatePicker } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useFeatures } from '@/hooks/use-features';

const isCurrentOrFutureDate = (date: Date) => (date && new Date().setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0));

const isFiveMinutesFromNow = (selectedDate: Date) => {
  const fiveMinutesFromNow = new Date(new Date().getTime() + 1000 * 60 * 5);

  return fiveMinutesFromNow.getTime() < selectedDate.getTime();
};

const messages = defineMessages({
  schedule: { id: 'schedule.post_time', defaultMessage: 'Post date/time' },
  remove: { id: 'schedule.remove', defaultMessage: 'Remove schedule' },
});

interface IScheduleForm {
  composeId: string;
}

const ScheduleForm: React.FC<IScheduleForm> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const { scheduledAt } = useCompose(composeId);
  const active = !!scheduledAt;

  const onSchedule = (date: Date | null) => {
    if (date === null) dispatch(removeSchedule(composeId));
    else dispatch(setSchedule(composeId, date));
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(removeSchedule(composeId));
    e.preventDefault();
  };

  const isValidTime = useCallback(
    (date: Date) => isFiveMinutesFromNow(date) || features.scheduledStatusesBackwards && new Date().getTime() > date.getTime(),
    [features.scheduledStatusesBackwards],
  );

  if (!active) {
    return null;
  }

  return (
    <div className='⁂-compose-form__schedule'>
      <p className='⁂-compose-form__schedule__hint'>
        <FormattedMessage id='datepicker.hint' defaultMessage='Scheduled to post at…' />
      </p>
      <div className='⁂-compose-form__schedule__date'>
        <Suspense fallback={<Input type='text' disabled />}>
          <DatePicker
            selected={scheduledAt}
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            onChange={onSchedule}
            placeholderText={intl.formatMessage(messages.schedule)}
            filterDate={features.scheduledStatusesBackwards ? undefined : isCurrentOrFutureDate}
            filterTime={isValidTime}
            className={clsx({
              'has-error': !isValidTime(scheduledAt),
            })}
            portalId='plfe'
          />
        </Suspense>
        <IconButton
          src={require('@phosphor-icons/core/regular/x.svg')}
          onClick={handleRemove}
          title={intl.formatMessage(messages.remove)}
        />
      </div>
    </div>
  );
};

export { ScheduleForm as default, isCurrentOrFutureDate };
