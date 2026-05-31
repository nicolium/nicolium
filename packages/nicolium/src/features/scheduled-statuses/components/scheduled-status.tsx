import clsx from 'clsx';
import React from 'react';

import Account from '@/components/accounts/account';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import PollPreview from '@/components/polls/poll-preview';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import { buildPoll } from '@/features/draft-statuses/builder';
import { useOwnAccount } from '@/hooks/use-own-account';

import { buildStatus } from '../builder';

import ScheduledStatusActionBar from './scheduled-status-action-bar';

import type { ScheduledStatus as ScheduledStatusEntity } from 'pl-api';

interface IScheduledStatus {
  scheduledStatus: ScheduledStatusEntity;
}

const ScheduledStatus: React.FC<IScheduledStatus> = ({ scheduledStatus, ...other }) => {
  const { data: ownAccount } = useOwnAccount();

  if (!ownAccount) return null;

  const status = buildStatus(ownAccount, scheduledStatus);
  const poll = scheduledStatus.params.poll ? buildPoll(scheduledStatus.params.poll) : null;

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
