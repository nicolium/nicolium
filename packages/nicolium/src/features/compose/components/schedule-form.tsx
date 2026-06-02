import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React, { Suspense, useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import { DatePicker } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useCompose, useComposeActions } from '@/stores/compose';

const isCurrentOrFutureDate = (date: Date) =>
  date && new Date().setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0);

const isFiveMinutesFromNow = (selectedDate: Date) => {
  const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5);

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
  const { updateCompose } = useComposeActions();
  const intl = useIntl();
  const features = useFeatures();

  const { scheduledAt } = useCompose(composeId);
  const active = !!scheduledAt;

  const onSchedule = (date: Date | null) => {
    updateCompose(composeId, (draft) => {
      draft.scheduledAt = date;
    });
  };

  const handleRemove: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    updateCompose(composeId, (draft) => {
      draft.scheduledAt = null;
    });
    e.preventDefault();
  };

  const isValidTime = useCallback(
    (date: Date) =>
      isFiveMinutesFromNow(date) ||
      (features.scheduledStatusesBackwards && Date.now() > date.getTime()),
    [features.scheduledStatusesBackwards],
  );

  if (!active) {
    return null;
  }

  return (
    <div className='compose-form__schedule'>
      <p className='compose-form__schedule__hint'>
        <FormattedMessage id='datepicker.hint' defaultMessage='Scheduled to post at…' />
      </p>
      <div className='compose-form__schedule__date'>
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
            portalId='app'
          />
        </Suspense>
        <IconButton
          src={iconX}
          onClick={handleRemove}
          title={intl.formatMessage(messages.remove)}
        />
      </div>
    </div>
  );
};

export { ScheduleForm as default, isCurrentOrFutureDate, isFiveMinutesFromNow };
