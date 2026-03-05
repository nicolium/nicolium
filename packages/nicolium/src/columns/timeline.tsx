import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedList, FormattedMessage } from 'react-intl';

import ScrollTopButton from '@/components/scroll-top-button';
import ScrollableList from '@/components/scrollable-list';
import Status, { StatusFollowedTagInfo } from '@/components/statuses/status';
import StatusInfo from '@/components/statuses/status-info';
import Tombstone from '@/components/statuses/tombstone';
import Icon from '@/components/ui/icon';
import Portal from '@/components/ui/portal';
import Emojify from '@/features/emoji/emojify';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import PendingStatus from '@/features/ui/components/pending-status';
import { useFeatures } from '@/hooks/use-features';
import { useAccounts } from '@/queries/accounts/use-accounts';
import { type SelectedStatus, useStatus } from '@/queries/statuses/use-status';
import {
  useAccountTimeline,
  useAntennaTimeline,
  useBubbleTimeline,
  useCircleTimeline,
  useGroupTimeline,
  useHashtagTimeline,
  useHomeTimeline,
  useLinkTimeline,
  useListTimeline,
  usePublicTimeline,
  useWrenchedTimeline,
} from '@/queries/timelines/use-timelines';
import { selectChild } from '@/utils/scroll-utils';

import type { FilterContextType } from '@/queries/settings/use-filters';
import type { TimelineEntry } from '@/stores/timelines';
import type { VirtuosoHandle } from 'react-virtuoso';

const messages = defineMessages({
  queue: {
    id: 'status_list.queue_label',
    defaultMessage: 'Click to see {count} new {count, plural, one {post} other {posts}}',
  },
  queueLiveRegion: {
    id: 'status_list.queue_label.live_region',
    defaultMessage: '{count} new {count, plural, one {post} other {posts}}.',
  },
});

const PlaceholderTimelineStatus = () => (
  <div className='⁂-timeline-status relative border-b border-solid border-gray-200 dark:border-gray-800'>
    <PlaceholderStatus variant='slim' />
  </div>
);

interface ITimelinePendingStatus {
  idempotencyKey: string;
}

const TimelinePendingStatus: React.FC<ITimelinePendingStatus> = ({ idempotencyKey }) => {
  return (
    <div className='⁂-timeline-status relative border-b border-solid border-gray-200 dark:border-gray-800'>
      <PendingStatus idempotencyKey={idempotencyKey} variant='slim' />
    </div>
  );
};

interface ITimelineStatusInfo {
  status: SelectedStatus;
  rebloggedBy: Array<string>;
  timelineId: string;
}

const TimelineStatusInfo: React.FC<ITimelineStatusInfo> = ({ status, rebloggedBy, timelineId }) => {
  const features = useFeatures();
  const isReblogged = rebloggedBy.length > 0;

  const { data: accounts } = useAccounts(rebloggedBy);

  if (isReblogged) {
    const renderedAccounts = accounts.slice(0, 2).map(
      (account) =>
        !!account && (
          <Link
            key={account.acct}
            to='/@{$username}'
            params={{ username: account.acct }}
            className='hover:underline'
          >
            <bdi className='truncate'>
              <strong className='text-gray-800 dark:text-gray-200'>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </strong>
            </bdi>
          </Link>
        ),
    );

    if (accounts.length > 2) {
      renderedAccounts.push(
        <FormattedMessage
          id='notification.more'
          defaultMessage='{count, plural, one {# other} other {# others}}'
          values={{ count: accounts.length - renderedAccounts.length }}
        />,
      );
    }

    const values = {
      name: <FormattedList type='conjunction' value={renderedAccounts} />,
      count: accounts.length,
    };

    return (
      <StatusInfo
        className='mt-4'
        avatarSize={42}
        icon={
          <Icon
            src={require('@phosphor-icons/core/regular/repeat.svg')}
            className='size-4 text-green-600'
            aria-hidden
          />
        }
        text={
          // status.visibility === 'private' ? (
          //   <FormattedMessage
          //     id='status.reblogged_by_private'
          //     defaultMessage='{name} reposted to followers'
          //     values={values}
          //   />
          // ) : (
          <FormattedMessage
            id='status.reblogged_by'
            defaultMessage='{name} reposted'
            values={values}
          />
          // )
        }
      />
    );
  }
  if (timelineId.split(':')[0] === 'home' && features.followHashtags) {
    return <StatusFollowedTagInfo className='mt-4' status={status} avatarSize={42} />;
  }
};

interface ITimelineStatus {
  id: string;
  rebloggedBy: Array<string>;
  timelineId: string;
  contextType?: FilterContextType;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
  onMoveUp?: (id: string) => void | boolean;
  onMoveDown?: (id: string) => void | boolean;
}

/** Status with reply-connector in threads. */
const TimelineStatus: React.FC<ITimelineStatus> = (props): React.JSX.Element => {
  const { id, isConnectedTop, isConnectedBottom } = props;

  const statusQuery = useStatus(id, { withFilteredResults: true });

  if (statusQuery.data?.deleted) {
    return (
      <div className='py-4 pb-8'>
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderConnector = (): React.JSX.Element | null => {
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx(
          'absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5',
          {
            'top-[calc(28px+42px)] !block h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
          },
        )}
      />
    );
  };

  return (
    <div
      className={clsx('⁂-timeline-status relative', {
        '⁂-timeline-status--connected-bottom': isConnectedBottom,
        '⁂-timeline-status--connected-top': isConnectedTop,
      })}
    >
      {statusQuery.data && (
        <TimelineStatusInfo
          status={statusQuery.data!}
          rebloggedBy={props.rebloggedBy}
          timelineId={props.timelineId}
        />
      )}
      {renderConnector()}
      {statusQuery.isPending ? (
        <PlaceholderStatus variant='slim' />
      ) : statusQuery.data ? (
        <Status status={statusQuery.data!} variant='slim' {...props} />
      ) : null}
    </div>
  );
};

interface ITimeline {
  query: ReturnType<typeof useHomeTimeline>;
  contextType?: FilterContextType;
}

const Timeline: React.FC<ITimeline> = ({ query, contextType = 'public' }) => {
  const node = useRef<VirtuosoHandle | null>(null);

  const {
    timelineId,
    entries,
    queuedCount,
    fetchNextPage,
    dequeueEntries,
    isFetching,
    isPending,
    hasNextPage,
  } = query;

  const handleMoveUp = (index: number) =>
    selectChild(index - 1, node, document.getElementById('status-list') ?? undefined);

  const handleMoveDown = (index: number) =>
    selectChild(
      index + 1,
      node,
      document.getElementById('status-list') ?? undefined,
      entries.length,
    );

  const renderEntry = (entry: TimelineEntry, index: number) => {
    if (entry.type === 'status') {
      return (
        <TimelineStatus
          key={entry.id}
          id={entry.id}
          isConnectedTop={entry.isConnectedTop}
          isConnectedBottom={entry.isConnectedBottom}
          contextType={contextType}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          rebloggedBy={entry.rebloggedBy}
          timelineId={timelineId}
          // contextType={timelineId}
          // showGroup={showGroup}
          // variant={divideType === 'border' ? 'slim' : 'rounded'}
        />
      );
    } else if (entry.type === 'pending-status') {
      return <TimelinePendingStatus key={entry.id} idempotencyKey={entry.id} />;
    }
  };

  return (
    <>
      <Portal>
        <ScrollTopButton
          onClick={dequeueEntries}
          count={queuedCount}
          message={messages.queue}
          liveRegionMessage={messages.queueLiveRegion}
        />
      </Portal>
      <ScrollableList
        id='status-list'
        key='scrollable-list'
        isLoading={isFetching}
        showLoading={isPending}
        placeholderComponent={() => <PlaceholderTimelineStatus />}
        placeholderCount={20}
        ref={node}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
      >
        {(entries || []).map(renderEntry)}
      </ScrollableList>
    </>
  );
};

const HomeTimelineColumn = () => {
  const timelineQuery = useHomeTimeline();

  return <Timeline query={timelineQuery} contextType='home' />;
};

interface IPublicTimelineColumn {
  local?: boolean;
  remote?: boolean;
  instance?: string;
}

const PublicTimelineColumn: React.FC<IPublicTimelineColumn> = (params) => {
  const timelineQuery = usePublicTimeline(params);

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface IHashtagTimelineColumn {
  hashtag: string;
}

const HashtagTimelineColumn: React.FC<IHashtagTimelineColumn> = ({ hashtag }) => {
  const timelineQuery = useHashtagTimeline(hashtag);

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface ILinkTimelineColumn {
  url: string;
}

const LinkTimelineColumn: React.FC<ILinkTimelineColumn> = ({ url }) => {
  const timelineQuery = useLinkTimeline(url);

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface IListTimelineColumn {
  listId: string;
}

const ListTimelineColumn: React.FC<IListTimelineColumn> = ({ listId }) => {
  const timelineQuery = useListTimeline(listId);

  return <Timeline query={timelineQuery} contextType='home' />;
};

interface IGroupTimelineColumn {
  groupId: string;
}

const GroupTimelineColumn: React.FC<IGroupTimelineColumn> = ({ groupId }) => {
  const timelineQuery = useGroupTimeline(groupId);

  return <Timeline query={timelineQuery} contextType='public' />;
};

const BubbleTimelineColumn = () => {
  const timelineQuery = useBubbleTimeline();

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface IAntennaTimelineColumn {
  antennaId: string;
}

const AntennaTimelineColumn: React.FC<IAntennaTimelineColumn> = ({ antennaId }) => {
  const timelineQuery = useAntennaTimeline(antennaId);

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface ICircleTimelineColumn {
  circleId: string;
}

const CircleTimelineColumn: React.FC<ICircleTimelineColumn> = ({ circleId }) => {
  const timelineQuery = useCircleTimeline(circleId);

  return <Timeline query={timelineQuery} contextType='public' />;
};

const WrenchedTimelineColumn = () => {
  const timelineQuery = useWrenchedTimeline();

  return <Timeline query={timelineQuery} contextType='public' />;
};

interface IAccountTimelineColumn {
  accountId: string;
  excludeReplies?: boolean;
}

const AccountTimelineColumn: React.FC<IAccountTimelineColumn> = ({
  accountId,
  excludeReplies = false,
}) => {
  const timelineQuery = useAccountTimeline(accountId, { exclude_replies: excludeReplies });

  return <Timeline query={timelineQuery} contextType='public' />;
};

export {
  HomeTimelineColumn,
  PublicTimelineColumn,
  HashtagTimelineColumn,
  LinkTimelineColumn,
  ListTimelineColumn,
  GroupTimelineColumn,
  BubbleTimelineColumn,
  AntennaTimelineColumn,
  CircleTimelineColumn,
  WrenchedTimelineColumn,
  AccountTimelineColumn,
};
