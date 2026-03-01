import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { importEntities } from '@/actions/importer';
import { useTimelineStream } from '@/api/hooks/streaming/use-timeline-stream';
import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

import type { PaginatedResponse, Status } from 'pl-api';

type TimelineEntry =
  | {
      type: 'status';
      id: string;
      rebloggedBy: Array<string>;
      isConnectedTop?: boolean;
      isConnectedBottom?: boolean;
    }
  | {
      type: 'pending-status';
      id: string;
    }
  | {
      type: 'gap';
    }
  | {
      type: 'page-start';
      maxId?: string;
    }
  | {
      type: 'page-end';
      minId?: string;
    };

const processPage = ({ items: statuses, next }: PaginatedResponse<Status>) => {
  const timelinePage: Array<TimelineEntry> = [];

  // if (previous) timelinePage.push({
  //   type: 'page-start',
  //   maxId: statuses.at(0)?.id,
  // });

  const processStatus = (status: Status) => {
    if (timelinePage.some((entry) => entry.type === 'status' && entry.id === status.id))
      return false;

    let isConnectedTop = false;
    const inReplyToId = (status.reblog || status).in_reply_to_id;

    if (inReplyToId) {
      const foundStatus = statuses.find((status) => (status.reblog || status).id === inReplyToId);

      if (foundStatus) {
        if (processStatus(foundStatus)) {
          const lastEntry = timelinePage.at(-1);
          // it's always of type status but doing this to satisfy ts
          if (lastEntry?.type === 'status') lastEntry.isConnectedBottom = true;

          isConnectedTop = true;
        }
      }
    }

    if (status.reblog) {
      const existingEntry = timelinePage.find(
        (entry) => entry.type === 'status' && entry.id === status.reblog!.id,
      );

      if (existingEntry?.type === 'status') {
        existingEntry.rebloggedBy.push(status.account.id);
      } else {
        timelinePage.push({
          type: 'status',
          id: status.reblog.id,
          rebloggedBy: [status.account.id],
          isConnectedTop,
        });
      }
      return true;
    }

    timelinePage.push({
      type: 'status',
      id: status.id,
      rebloggedBy: [],
      isConnectedTop,
    });

    return true;
  };

  for (const status of statuses) {
    processStatus(status);
  }

  if (next)
    timelinePage.push({
      type: 'page-end',
      minId: statuses.at(-1)?.id,
    });

  return timelinePage;
};

const useHomeTimeline = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  useTimelineStream('home');

  const [isLoading, setIsLoading] = useState(true);

  const queryKey = queryKeys.timelines.home;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      setIsLoading(true);

      const response = await client.timelines.homeTimeline();

      importEntities({ statuses: response.items });

      return processPage(response);
    },
  });

  const handleLoadMore = useCallback(
    async (entry: TimelineEntry) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        if (entry.type !== 'page-end' && entry.type !== 'page-start') return;

        const response = await client.timelines.homeTimeline(
          entry.type === 'page-end' ? { max_id: entry.minId } : { min_id: entry.maxId },
        );

        importEntities({ statuses: response.items });

        const timelinePage = processPage(response);

        queryClient.setQueryData(queryKeys.timelines.home, (oldData) => {
          if (!oldData) return timelinePage;

          const index = oldData.indexOf(entry);
          return oldData.toSpliced(index, 1, ...timelinePage);
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  return useMemo(() => ({ ...query, handleLoadMore, isLoading }), [query, isLoading]);
};

export { useHomeTimeline, type TimelineEntry };
