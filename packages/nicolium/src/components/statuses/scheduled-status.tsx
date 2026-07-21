import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import PollPreview from '@/components/polls/poll-preview';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import { buildPollFromParams } from '@/features/draft-statuses/builder';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useCancelScheduledStatusMutation } from '@/queries/statuses/scheduled-statuses';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { buildStatusFromScheduledStatus } from '../../features/scheduled-statuses/builder';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';
import type { ScheduledStatus as ScheduledStatusEntity } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'scheduled_status.cancel', defaultMessage: 'Cancel' },
  deleteConfirm: { id: 'confirmations.scheduled_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: {
    id: 'confirmations.scheduled_status_delete.heading',
    defaultMessage: 'Cancel scheduled post',
  },
  deleteMessage: {
    id: 'confirmations.scheduled_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this scheduled post?',
  },
});

interface IScheduledStatusActionBar {
  status: StatusEntity;
}

const ScheduledStatusActionBar: React.FC<IScheduledStatusActionBar> = ({ status }) => {
  const intl = useIntl();

  const { mutate: cancelScheduledStatus } = useCancelScheduledStatusMutation(status.id);
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const handleCancelClick = () => {
    const deleteModal = settings.deleteModal;
    if (!deleteModal) {
      cancelScheduledStatus();
    } else {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteMessage),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => {
          cancelScheduledStatus();
        },
      });
    }
  };

  return (
    <div className='scheduled-status__actions'>
      <button onClick={handleCancelClick}>
        <FormattedMessage id='scheduled_status.cancel' defaultMessage='Cancel' />
      </button>
    </div>
  );
};

interface IScheduledStatus {
  scheduledStatus: ScheduledStatusEntity;
}

const ScheduledStatus: React.FC<IScheduledStatus> = ({ scheduledStatus, ...other }) => {
  const { data: ownAccount } = useOwnAccount();

  if (!ownAccount) return null;

  const status = buildStatusFromScheduledStatus(ownAccount, scheduledStatus);
  const poll = scheduledStatus.params.poll
    ? buildPollFromParams(scheduledStatus.params.poll)
    : null;

  if (!status) return null;

  return (
    <div
      className={clsx('status__wrapper scheduled-status', `status__wrapper-${status.visibility}`, {
        'status__wrapper-reply': !!status.in_reply_to_id,
      })}
      tabIndex={0}
    >
      <div
        className={clsx('status', `status--${status.visibility}`, {
          'status--reply': !!status.in_reply_to_id,
        })}
        data-id={status.id}
      >
        <div className='scheduled-status__account'>
          <Account
            key={ownAccount.id}
            account={ownAccount}
            timestamp={status.created_at}
            futureTimestamp
            action={<ScheduledStatusActionBar status={status} {...other} />}
          />
        </div>

        <StatusReplyMentions status={status} />

        <div className='scheduled-status__content'>
          <StatusContent status={status} expandable />

          {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}

          {poll && <PollPreview poll={poll} />}
        </div>
      </div>
    </div>
  );
};

export { ScheduledStatus as default };
