import clsx from 'clsx';
import React from 'react';

import LoadMore from '@/components/load-more';
import ScrollableList from '@/components/scrollable-list';
import Status from '@/components/statuses/status';
import Tombstone from '@/components/statuses/tombstone';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useAntennaTimeline,
  useBubbleTimeline,
  useGroupTimeline,
  useHashtagTimeline,
  useHomeTimeline,
  useLinkTimeline,
  useListTimeline,
  usePublicTimeline,
  useWrenchedTimeline,
} from '@/queries/timelines/use-timelines';

import type { FilterContextType } from '@/queries/settings/use-filters';
import type { TimelineEntry } from '@/stores/timelines';

interface ITimelineStatus {
  id: string;
  contextType?: FilterContextType;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
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
        'border-b border-solid border-gray-200 dark:border-gray-800': !isConnectedBottom,
        '⁂-timeline-status--connected-top': isConnectedTop,
      })}
    >
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
  const { entries, fetchNextPage, isFetching, isPending } = query;

  const renderEntry = (entry: TimelineEntry) => {
    if (entry.type === 'status') {
      return (
        <TimelineStatus
          key={entry.id}
          id={entry.id}
          isConnectedTop={entry.isConnectedTop}
          isConnectedBottom={entry.isConnectedBottom}
          contextType={contextType}
          // onMoveUp={handleMoveUp}
          // onMoveDown={handleMoveDown}
          // contextType={timelineId}
          // showGroup={showGroup}
          // variant={divideType === 'border' ? 'slim' : 'rounded'}
        />
      );
    }
    if (entry.type === 'page-end' || entry.type === 'page-start') {
      return (
        <div className='m-4'>
          <LoadMore key='load-more' onClick={fetchNextPage} disabled={isFetching} />
        </div>
      );
    }
  };

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      isLoading={isFetching}
      showLoading={isPending}
      placeholderComponent={() => <PlaceholderStatus variant={'slim'} />}
      placeholderCount={20}
      // className={className}
      // listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', {
      //   'divide-none': divideType !== 'border',
      // })}
      // itemClassName={clsx({
      //   'pb-3': divideType !== 'border',
      // })}
      // {...other}
    >
      {(entries || []).map(renderEntry)}
    </ScrollableList>
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

const WrenchedTimelineColumn = () => {
  const timelineQuery = useWrenchedTimeline();

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
  WrenchedTimelineColumn,
};
