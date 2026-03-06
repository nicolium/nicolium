import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useMemo, useRef, useState } from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';

import ScrollTopButton from '@/components/scroll-top-button';
import ScrollableList, { type IScrollableList } from '@/components/scrollable-list';
import Status, { StatusFollowedTagInfo } from '@/components/statuses/status';
import StatusInfo from '@/components/statuses/status-info';
import Tombstone from '@/components/statuses/tombstone';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Portal from '@/components/ui/portal';
import Stack from '@/components/ui/stack';
import Emojify from '@/features/emoji/emojify';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import PendingStatus from '@/features/ui/components/pending-status';
import { useAppSelector } from '@/hooks/use-app-selector';
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
  gapExplanation: {
    id: 'timeline.gap.explanation',
    defaultMessage: 'Time elapsed between the two posts surrounding the gap.',
  },
  gapExplanationFirst: {
    id: 'timeline.gap.explanation_first',
    defaultMessage: 'Time elapsed since the post before the gap.',
  },
});

const SkipPinned: React.FC<React.ComponentProps<'button'>> = ({ onClick }) => {
  return (
    <button className='⁂-skip-pinned' onClick={onClick}>
      <Icon src={require('@phosphor-icons/core/regular/arrow-line-down.svg')} />

      <p>
        <FormattedMessage id='status.skip_pinned' defaultMessage='Skip pinned posts' />
      </p>
    </button>
  );
};

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

interface ITimelineGap {
  gap: Extract<TimelineEntry, { type: 'gap' }>;
  onFillGap: (
    gap: Extract<TimelineEntry, { type: 'gap' }>,
    direction: 'up' | 'down',
  ) => Promise<void>;
  firstEntry: boolean;
}

const TimelineGap: React.FC<ITimelineGap> = ({ gap, onFillGap, firstEntry }) => {
  const [isLoading, setIsLoading] = useState(false);
  const intl = useIntl();

  const handleFill = async (direction: 'up' | 'down') => {
    setIsLoading(true);
    try {
      await onFillGap(gap, direction);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTimeDistance = () => {
    console.log(gap);
    if (!gap.minDate) return null;

    const maxDate = gap.maxIdDate ? new Date(gap.maxIdDate) : new Date();
    const minDate = new Date(gap.minDate);

    const diff = Math.abs(maxDate.getTime() - minDate.getTime());
    if (diff < 60 * 1000) {
      return (
        <FormattedMessage
          id='datetime.distance.less_than_minute'
          defaultMessage='Less than a minute'
        />
      );
    } else if (diff < 60 * 60 * 1000) {
      const minutes = Math.round(diff / (60 * 1000));
      return (
        <FormattedMessage
          id='datetime.distance.minutes'
          defaultMessage='{distance} {distance, plural, one {minute} other {minutes}}'
          values={{ distance: minutes }}
        />
      );
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.round(diff / (60 * 60 * 1000));
      return (
        <FormattedMessage
          id='datetime.distance.hours'
          defaultMessage='{distance} {distance, plural, one {hour} other {hours}}'
          values={{ distance: hours }}
        />
      );
    } else if (diff < 30 * 24 * 60 * 60 * 1000) {
      const days = Math.round(diff / (24 * 60 * 60 * 1000));
      return (
        <FormattedMessage
          id='datetime.distance.days'
          defaultMessage='{distance} {distance, plural, one {day} other {days}}'
          values={{ distance: days }}
        />
      );
    } else if (diff < 365 * 24 * 60 * 60 * 1000) {
      const months = Math.round(diff / (30 * 24 * 60 * 60 * 1000));
      return (
        <FormattedMessage
          id='datetime.distance.months'
          defaultMessage='{distance} {distance, plural, one {month} other {months}}'
          values={{ distance: months }}
        />
      );
    } else {
      const years = Math.round(diff / (365 * 24 * 60 * 60 * 1000));
      return (
        <FormattedMessage
          id='datetime.distance.years'
          defaultMessage='{distance} {distance, plural, one {year} other {years}}'
          values={{ distance: years }}
        />
      );
    }
  };

  return (
    <Stack className='⁂-timeline-gap mx-auto items-stretch'>
      <Button
        theme='transparent'
        icon={require('@phosphor-icons/core/regular/caret-double-down.svg')}
        onClick={() => handleFill('down')}
        disabled={isLoading}
      >
        {firstEntry ? (
          <FormattedMessage id='timeline.gap.load_recent' defaultMessage='Load recent posts' />
        ) : (
          <FormattedMessage id='timeline.gap.load_older' defaultMessage='Load older posts' />
        )}
      </Button>
      <div className='⁂-timeline-gap__separator'>
        <span
          title={intl.formatMessage(
            firstEntry ? messages.gapExplanationFirst : messages.gapExplanation,
          )}
        >
          {renderTimeDistance()}
        </span>
      </div>
      <Button
        theme='transparent'
        icon={require('@phosphor-icons/core/regular/caret-double-up.svg')}
        onClick={() => handleFill('up')}
        disabled={isLoading}
      >
        <FormattedMessage id='timeline.gap.load_newer' defaultMessage='Load newer posts' />
      </Button>
    </Stack>
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
  featured?: boolean;
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

  const connector = renderConnector();

  const status = statusQuery.isPending ? (
    <PlaceholderStatus variant='slim' />
  ) : statusQuery.data ? (
    <Status status={statusQuery.data!} variant='slim' {...props} />
  ) : null;

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
      {connector ? (
        <div className='relative'>
          {connector}
          {status}
        </div>
      ) : (
        status
      )}
    </div>
  );
};

type IBaseTimeline = Pick<
  IScrollableList,
  'emptyMessageIcon' | 'emptyMessageText' | 'onTopItemChanged'
> & {
  featuredStatusIds?: Array<string>;
};

interface ITimeline extends IBaseTimeline {
  query: ReturnType<typeof useHomeTimeline>;
  contextType?: FilterContextType;
}

const Timeline: React.FC<ITimeline> = ({
  query,
  contextType = 'public',
  featuredStatusIds,
  ...props
}) => {
  const node = useRef<VirtuosoHandle | null>(null);

  const {
    timelineId,
    entries,
    queuedCount,
    fetchNextPage,
    dequeueEntries,
    fillGap,
    isFetching,
    isPending,
    hasNextPage,
  } = query;

  const handleMoveUp = (index: number) => {
    console.log(index);
    selectChild(index - 1, node, document.getElementById('status-list') ?? undefined);
  };

  const handleMoveDown = (index: number) => {
    console.log(index);
    selectChild(
      index + 1,
      node,
      document.getElementById('status-list') ?? undefined,
      entries.length,
    );
  };

  const handleSkipPinned = () => {
    const skipPinned = () => {
      selectChild(
        featuredStatusIds?.length ?? 0,
        node,
        document.getElementById('status-list') ?? undefined,
        (featuredStatusIds?.length ?? 0) + entries.length,
        'start',
      );
    };

    skipPinned();

    setTimeout(() => skipPinned, 0);
  };

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
          // showGroup={showGroup}
        />
      );
    } else if (entry.type === 'pending-status') {
      return <TimelinePendingStatus key={entry.id} idempotencyKey={entry.id} />;
    } else if (entry.type === 'gap') {
      return (
        <TimelineGap
          key={`gap-${entry.minId}`}
          gap={entry}
          onFillGap={fillGap}
          firstEntry={index === 0}
        />
      );
    }
  };

  const renderedEntries = useMemo(() => {
    const rendered = [];

    if (featuredStatusIds && featuredStatusIds.length > 0) {
      for (const id of featuredStatusIds) {
        const index = rendered.length;
        rendered.push(
          <TimelineStatus
            key={id}
            id={id}
            contextType={contextType}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            rebloggedBy={[]}
            timelineId={timelineId}
            featured
          />,
        );
      }
    }

    for (const entry of entries) {
      rendered.push(renderEntry(entry, rendered.length));
    }

    return rendered;
  }, [entries, contextType, timelineId, featuredStatusIds]);

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
      {featuredStatusIds && featuredStatusIds.length > 3 && entries?.length > 0 && (
        <SkipPinned onClick={handleSkipPinned} />
      )}
      <ScrollableList
        id='status-list'
        key='scrollable-list'
        scrollKey={timelineId}
        isLoading={isFetching}
        showLoading={isPending}
        placeholderComponent={() => <PlaceholderTimelineStatus />}
        placeholderCount={20}
        ref={node}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        {...props}
      >
        {renderedEntries}
      </ScrollableList>
    </>
  );
};

const savePosition = (me: string, entry: TimelineEntry, index: number) => {
  if (!entry || entry.type !== 'status') return;
  return localStorage.setItem(
    `nicolium:${me}:homeTimelinePosition`,
    `${entry.originalId}|${index}|${Date.now()}`,
  );
};

const getRestoredPosition = (me: string) => {
  const markerKey = `nicolium:${me}:homeTimelinePosition`;
  const marker = localStorage.getItem(markerKey);
  if (!marker) return null;

  return marker.split('|');
};

const HomeTimelineColumn: React.FC<IBaseTimeline> = (props) => {
  const me = useAppSelector((state) => state.me);

  const maxId = useMemo(() => {
    if (!me) return undefined;

    const position = getRestoredPosition(me);

    if (!position) return undefined;

    if (position[1] === '0') {
      const timeDifference = Date.now() - parseInt(position[2], 10);

      if (timeDifference > 15 * 60 * 1000) {
        return position[0];
      }
      return undefined;
    }
    return position[0];
  }, []);

  const timelineQuery = useHomeTimeline(undefined, maxId);

  const handleTopItemChanged = (index: number) => {
    const entry = timelineQuery.entries[index];
    if (me) savePosition(me, entry, index);
  };

  return (
    <Timeline
      query={timelineQuery}
      contextType='home'
      onTopItemChanged={handleTopItemChanged}
      {...props}
    />
  );
};

interface IPublicTimelineColumn extends IBaseTimeline {
  local?: boolean;
  remote?: boolean;
  instance?: string;
}

const PublicTimelineColumn: React.FC<IPublicTimelineColumn> = ({
  local,
  remote,
  instance,
  ...props
}) => {
  const timelineQuery = usePublicTimeline({ local, remote, instance });

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface IHashtagTimelineColumn extends IBaseTimeline {
  hashtag: string;
}

const HashtagTimelineColumn: React.FC<IHashtagTimelineColumn> = ({ hashtag, ...props }) => {
  const timelineQuery = useHashtagTimeline(hashtag);

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface ILinkTimelineColumn extends IBaseTimeline {
  url: string;
}

const LinkTimelineColumn: React.FC<ILinkTimelineColumn> = ({ url, ...props }) => {
  const timelineQuery = useLinkTimeline(url);

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface IListTimelineColumn extends IBaseTimeline {
  listId: string;
}

const ListTimelineColumn: React.FC<IListTimelineColumn> = ({ listId, ...props }) => {
  const timelineQuery = useListTimeline(listId);

  return <Timeline query={timelineQuery} contextType='home' {...props} />;
};

interface IGroupTimelineColumn extends IBaseTimeline {
  groupId: string;
}

const GroupTimelineColumn: React.FC<IGroupTimelineColumn> = ({ groupId, ...props }) => {
  const timelineQuery = useGroupTimeline(groupId);

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

const BubbleTimelineColumn: React.FC<IBaseTimeline> = (props) => {
  const timelineQuery = useBubbleTimeline();

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface IAntennaTimelineColumn extends IBaseTimeline {
  antennaId: string;
}

const AntennaTimelineColumn: React.FC<IAntennaTimelineColumn> = ({ antennaId, ...props }) => {
  const timelineQuery = useAntennaTimeline(antennaId);

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface ICircleTimelineColumn extends IBaseTimeline {
  circleId: string;
}

const CircleTimelineColumn: React.FC<ICircleTimelineColumn> = ({ circleId, ...props }) => {
  const timelineQuery = useCircleTimeline(circleId);

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

const WrenchedTimelineColumn: React.FC<IBaseTimeline> = (props) => {
  const timelineQuery = useWrenchedTimeline();

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
};

interface IAccountTimelineColumn extends IBaseTimeline {
  accountId: string;
  excludeReplies?: boolean;
}

const AccountTimelineColumn: React.FC<IAccountTimelineColumn> = ({
  accountId,
  excludeReplies = false,
  ...props
}) => {
  const timelineQuery = useAccountTimeline(accountId, { exclude_replies: excludeReplies });

  return <Timeline query={timelineQuery} contextType='public' {...props} />;
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
