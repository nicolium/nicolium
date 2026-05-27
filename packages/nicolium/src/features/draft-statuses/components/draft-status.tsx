import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from '@/components/accounts/account';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import OutlineBox from '@/components/outline-box';
import PollPreview from '@/components/polls/poll-preview';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useOwnAccount } from '@/hooks/use-own-account';

import { buildPoll, buildStatus } from '../builder';

import DraftStatusActionBar from './draft-status-action-bar';

import type { DraftStatus as DraftStatusType } from '@/queries/statuses/use-draft-statuses';

interface IDraftStatus {
  draftStatus: DraftStatusType;
}

const DraftStatus: React.FC<IDraftStatus> = ({ draftStatus, ...other }) => {
  const { data: ownAccount } = useOwnAccount();

  if (!ownAccount || !draftStatus) return null;

  const status = buildStatus(ownAccount, draftStatus);
  const poll = draftStatus.poll ? buildPoll(draftStatus.poll) : null;

  if (!status) return null;

  const account = ownAccount;

  let quote;

  if (status.quote_id) {
    if (!(status.quote_visible ?? true)) {
      quote = (
        <OutlineBox>
          <p>
            <FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' />
          </p>
        </OutlineBox>
      );
    } else {
      quote = <QuotedStatus statusId={status.quote_id} state='accepted' />;
    }
  }

  return (
    <div
      className={clsx('status__wrapper py-4', `status__wrapper-${status.visibility}`, {
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
        <div className='mb-4'>
          <div className='flex items-start justify-between'>
            <Account
              key={account.id}
              account={account}
              action={<DraftStatusActionBar source={draftStatus} status={status} {...other} />}
            />
          </div>
        </div>

        <StatusReplyMentions status={status} />

        <div className='flex flex-col gap-4'>
          <StatusContent status={status} collapsable />

          {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}

          {quote}

          {poll && <PollPreview poll={poll} />}
        </div>
      </div>
    </div>
  );
};

export { DraftStatus as default };
