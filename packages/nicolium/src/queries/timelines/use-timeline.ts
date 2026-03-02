import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { importEntities } from '@/actions/importer';
import { useTimelineStream } from '@/api/hooks/streaming/use-timeline-stream';

import type { DataTag } from '@tanstack/react-query';
import type { PaginatedResponse, Status, StreamingParams } from 'pl-api';

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

const processPage = ({
  items: statuses,
  next,
}: PaginatedResponse<Status>): Array<TimelineEntry> => {
  const timelinePage: Array<TimelineEntry> = [];

  const processStatus = (status: Status): boolean => {
    if (timelinePage.some((entry) => entry.type === 'status' && entry.id === status.id))
      return false;

    let isConnectedTop = false;
    const inReplyToId = (status.reblog || status).in_reply_to_id;

    if (inReplyToId) {
      const foundStatus = statuses.find((s) => (s.reblog || s).id === inReplyToId);

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

type PaginationParams = { max_id?: string; min_id?: string };
type TimelineFetcher = (params?: PaginationParams) => Promise<PaginatedResponse<Status>>;

interface StreamConfig {
  stream: string;
  params?: StreamingParams;
}

type TimelineQueryKey = DataTag<readonly unknown[], Array<TimelineEntry>>;

const useTimeline = (
  queryKey: TimelineQueryKey,
  fetcher: TimelineFetcher,
  streamConfig?: StreamConfig,
) => {
  const queryClient = useQueryClient();

  useTimelineStream(streamConfig?.stream ?? '', streamConfig?.params, !!streamConfig?.stream);

  const [isLoading, setIsLoading] = useState(true);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      setIsLoading(true);
      try {
        const response = await fetcher();
        importEntities({ statuses: response.items });
        return processPage(response);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleLoadMore = useCallback(
    async (entry: TimelineEntry) => {
      if (isLoading) return;
      if (entry.type !== 'page-end' && entry.type !== 'page-start') return;

      setIsLoading(true);
      try {
        const response = await fetcher(
          entry.type === 'page-end' ? { max_id: entry.minId } : { min_id: entry.maxId },
        );

        importEntities({ statuses: response.items });

        const timelinePage = processPage(response);

        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return timelinePage;
          const index = oldData.indexOf(entry);
          return oldData.toSpliced(index, 1, ...timelinePage);
        });
      } catch (error) {
        //
      }
      setIsLoading(false);
    },
    [isLoading, fetcher, queryKey, queryClient],
  );

  return useMemo(
    () => ({ ...query, handleLoadMore, isLoading }),
    [query, handleLoadMore, isLoading],
  );
};

export { useTimeline, type TimelineEntry };
