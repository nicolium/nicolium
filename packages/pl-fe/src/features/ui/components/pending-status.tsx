import clsx from 'clsx';
import React from 'react';

import Account from '@/components/account';
import StatusContent from '@/components/status-content';
import StatusReplyMentions from '@/components/status-reply-mentions';
import Card from '@/components/ui/card';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import PlaceholderCard from '@/features/placeholder/components/placeholder-card';
import PlaceholderMediaGallery from '@/features/placeholder/components/placeholder-media-gallery';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useAppSelector } from '@/hooks/use-app-selector';

import { buildStatus } from '../util/pending-status-builder';

import PollPreview from './poll-preview';

import type { Status as StatusEntity } from '@/normalizers/status';

const shouldHaveCard = (pendingStatus: StatusEntity) =>
  Boolean(pendingStatus.content.match(/https?:\/\/\S*/));

interface IPendingStatus {
  className?: string;
  idempotencyKey: string;
  muted?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
}

interface IPendingStatusMedia {
  status: StatusEntity;
}

const PendingStatusMedia: React.FC<IPendingStatusMedia> = ({ status }) => {
  if (status.media_attachments && status.media_attachments.length) {
    return <PlaceholderMediaGallery media={status.media_attachments} />;
  } else if (!status.quote && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  } else {
    return null;
  }
};

const PendingStatus: React.FC<IPendingStatus> = ({
  idempotencyKey,
  className,
  muted,
  variant = 'rounded',
}) => {
  const status = useAppSelector((state) => {
    const pendingStatus = state.pending_statuses[idempotencyKey];
    return pendingStatus ? buildStatus(state, pendingStatus, idempotencyKey) : null;
  });

  if (!status) return null;
  if (!status.account) return null;

  const account = status.account;

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
                key={account.id}
                account={account}
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

              {status.poll && <PollPreview poll={status.poll} />}

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
