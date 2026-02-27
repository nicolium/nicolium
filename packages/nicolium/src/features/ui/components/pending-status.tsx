import clsx from 'clsx';
import React from 'react';

import Account from '@/components/accounts/account';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Card from '@/components/ui/card';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import PlaceholderCard from '@/features/placeholder/components/placeholder-card';
import PlaceholderMediaGallery from '@/features/placeholder/components/placeholder-media-gallery';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useOwnAccount } from '@/hooks/use-own-account';
import { usePollQuery } from '@/queries/statuses/use-poll';
import { usePendingStatus } from '@/stores/pending-statuses';

import { buildStatus } from '../util/pending-status-builder';

import PollPreview from './poll-preview';

import type { NormalizedStatus as StatusEntity } from '@/reducers/statuses';

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

  const status = useAppSelector((state) => {
    return pendingStatus && ownAccount
      ? buildStatus(ownAccount, state, pendingStatus, idempotencyKey)
      : null;
  });

  const { data: poll } = usePollQuery(status?.poll_id ?? '');

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
          <div className='mb-4'>
            <HStack justifyContent='between' alignItems='start'>
              <Account
                key={ownAccount.id}
                account={ownAccount}
                timestamp={status.created_at}
                hideActions
                withLinkToProfile={false}
              />
            </HStack>
          </div>

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={status} />

            <Stack space={4}>
              <StatusContent status={status} collapsable />

              <PendingStatusMedia status={status} />

              {poll && <PollPreview poll={poll} />}

              {status.quote_id && <QuotedStatus statusId={status.quote_id} />}
            </Stack>
          </div>

          {/* TODO */}
          {/* <PlaceholderActionBar /> */}
        </Card>
      </div>
    </div>
  );
};

export { PendingStatus as default };
