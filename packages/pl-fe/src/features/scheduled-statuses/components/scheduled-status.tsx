import clsx from 'clsx';
import React from 'react';

import Account from '@/components/account';
import AttachmentThumbs from '@/components/attachment-thumbs';
import StatusContent from '@/components/status-content';
import StatusReplyMentions from '@/components/status-reply-mentions';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import { buildPoll } from '@/features/draft-statuses/builder';
import PollPreview from '@/features/ui/components/poll-preview';
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
      className={clsx('status__wrapper py-4', `status__wrapper-${status.visibility}`, {
        'status__wrapper-reply': !!status.in_reply_to_id,
      })}
      tabIndex={0}
    >
      <div
        className={clsx('status', `status-${status.visibility}`, {
          'status-reply': !!status.in_reply_to_id,
        })}
        data-id={status.id}
      >
        <div className='mb-4'>
          <HStack justifyContent='between' alignItems='start'>
            <Account
              key={ownAccount.id}
              account={ownAccount}
              timestamp={status.created_at}
              futureTimestamp
              action={<ScheduledStatusActionBar status={status} {...other} />}
            />
          </HStack>
        </div>

        <StatusReplyMentions status={status} />

        <Stack space={4}>
          <StatusContent status={status} collapsable={false} />

          {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}

          {poll && <PollPreview poll={poll} />}
        </Stack>
      </div>
    </div>
  );
};

export { ScheduledStatus as default };
