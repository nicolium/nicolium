import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useClient } from '@/contexts/current-account-context';
import { useTimeline } from '@/queries/timelines/use-timeline';

import { type ITimeline, Timeline } from '../timelines/timeline';

import type { TimelineEntry } from '@/stores/timelines';
import type { FlashListRef } from '@shopify/flash-list';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface IProfileTimeline extends Pick<ITimeline, 'header'> {
  ref?: React.RefObject<FlashListRef<TimelineEntry> | null>;
  pinnedCountRef?: React.RefObject<number>;
  id: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  withReplies?: boolean;
  withReblogs?: boolean;
  withPinned?: boolean;
}

const ProfileTimeline: React.FC<IProfileTimeline> = ({
  id,
  withReplies,
  withReblogs,
  withPinned,
  pinnedCountRef,
  ...props
}) => {
  const client = useClient();

  const pinnedQuery = useTimeline(`account:${id}:pinned`, (paginationParams) =>
    client.accounts.getAccountStatuses(id, { ...paginationParams, pinned: true }),
  );

  const timelineQuery = useTimeline(
    `account:${id}${withReblogs ? '' : ':exclude_reblogs'}${withReplies ? '' : ':exclude_replies'}`,
    (paginationParams) =>
      client.accounts.getAccountStatuses(id, {
        ...paginationParams,
        exclude_reblogs: !withReblogs,
        exclude_replies: !withReplies,
      }),
  );

  React.useEffect(() => {
    if (pinnedCountRef) pinnedCountRef.current = withPinned ? pinnedQuery.entries.length : 0;
  }, [withPinned, pinnedQuery.entries.length]);

  return (
    <Timeline
      query={timelineQuery}
      pinnedQuery={withPinned ? pinnedQuery : undefined}
      emptyMessageHeading={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
      context='account'
      {...props}
    />
  );
};

export { ProfileTimeline };
