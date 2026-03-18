import { skipToken, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';

import Account from '@/components/accounts/account';
import PlaceholderCard from '@/components/placeholders/placeholder-card';
import PlaceholderMediaGallery from '@/components/placeholders/placeholder-media-gallery';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Card from '@/components/ui/card';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useOwnAccount } from '@/hooks/use-own-account';
import { queryKeys } from '@/queries/keys';
import { usePendingStatus } from '@/stores/pending-statuses';

import { buildStatus } from '../../../utils/pending-status-builder';

import PollPreview from './poll-preview';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';
import type { Poll } from 'pl-api';

const shouldHaveCard = (pendingStatus: StatusEntity) =>
  Boolean(/https?:\/\/\S*/.test(pendingStatus.content));

interface IPendingStatus {
  className?: string;
  idempotencyKey: string;
  variant?: 'default' | 'rounded' | 'slim';
}

interface IPendingStatusMedia {
  status: StatusEntity;
}

const PendingStatusMedia: React.FC<IPendingStatusMedia> = ({ status }) => {
  if (status.media_attachments && status.media_attachments.length) {
    return <PlaceholderMediaGallery media={status.media_attachments} />;
  } else if (!status.quote_id && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  } else {
    return null;
  }
};

const PendingStatus: React.FC<IPendingStatus> = ({
  idempotencyKey,
  className,
  variant = 'rounded',
}) => {
  const pendingStatus = usePendingStatus(idempotencyKey);
  const { data: ownAccount } = useOwnAccount();

  const status =
    pendingStatus && ownAccount ? buildStatus(ownAccount, pendingStatus, idempotencyKey) : null;

  const { data: poll } = useQuery<Poll>({
    queryKey: queryKeys.statuses.polls.show(status?.poll_id ?? ''),
    queryFn: skipToken,
    enabled: !!status?.poll_id,
  });

  if (!status) return null;
  if (!ownAccount) return null;

  return (
    <div className={clsx('opacity-50', className)}>
      <div data-id={status.id}>
        <Card
          className={clsx(`status-${status.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
          })}
          variant={variant}
        >
          <div className='mb-4 flex items-start justify-between'>
            <Account
              key={ownAccount.id}
              account={ownAccount}
              timestamp={status.created_at}
              hideActions
              withLinkToProfile={false}
            />
          </div>

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={status} />

            <div className='flex flex-col gap-4'>
              <StatusContent status={status} collapsable />

              <PendingStatusMedia status={status} />

              {poll && <PollPreview poll={poll} />}

              {status.quote_id && <QuotedStatus statusId={status.quote_id} />}
            </div>
          </div>

          {/* TODO */}
          {/* <PlaceholderActionBar /> */}
        </Card>
      </div>
    </div>
  );
};

export { PendingStatus as default };
