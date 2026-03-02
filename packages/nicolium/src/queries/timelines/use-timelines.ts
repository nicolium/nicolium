import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

import { useTimeline } from './use-timeline';

import type {
  AntennaTimelineParams,
  BubbleTimelineParams,
  GroupTimelineParams,
  HashtagTimelineParams,
  HomeTimelineParams,
  LinkTimelineParams,
  ListTimelineParams,
  PaginationParams,
  PublicTimelineParams,
  WrenchedTimelineParams,
} from 'pl-api';

const useHomeTimeline = (params?: Omit<HomeTimelineParams, keyof PaginationParams>) => {
  const client = useClient();
  const stream = 'home';

  return useTimeline(
    queryKeys.timelines.home(params),
    (paginationParams) => client.timelines.homeTimeline({ ...params, ...paginationParams }),
    { stream },
  );
};

const usePublicTimeline = (params?: Omit<PublicTimelineParams, keyof PaginationParams>) => {
  const client = useClient();
  const stream = params?.local ? 'public:local' : params?.instance ? `public:remote` : 'public';

  return useTimeline(
    queryKeys.timelines.public(params?.local, params),
    (paginationParams) => client.timelines.publicTimeline({ ...params, ...paginationParams }),
    { stream },
  );
};

const useHashtagTimeline = (
  hashtag: string,
  params?: Omit<HashtagTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(
    queryKeys.timelines.hashtag(hashtag, params),
    (paginationParams) =>
      client.timelines.hashtagTimeline(hashtag, { ...params, ...paginationParams }),
    { stream: 'hashtag', params: { tag: hashtag } },
  );
};

const useLinkTimeline = (
  url: string,
  params?: Omit<LinkTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(queryKeys.timelines.link(url, params), (paginationParams) =>
    client.timelines.linkTimeline(url, { ...params, ...paginationParams }),
  );
};

const useListTimeline = (
  listId: string,
  params?: Omit<ListTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(
    queryKeys.timelines.list(listId, params),
    (paginationParams) => client.timelines.listTimeline(listId, { ...params, ...paginationParams }),
    { stream: 'list', params: { list: listId } },
  );
};

const useGroupTimeline = (
  groupId: string,
  params?: Omit<GroupTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(
    queryKeys.timelines.group(groupId, params),
    (paginationParams) =>
      client.timelines.groupTimeline(groupId, { ...params, ...paginationParams }),
    { stream: 'group', params: { group: groupId } },
  );
};

const useBubbleTimeline = (params?: Omit<BubbleTimelineParams, keyof PaginationParams>) => {
  const client = useClient();

  return useTimeline(
    queryKeys.timelines.bubble(params),
    (paginationParams) => client.timelines.bubbleTimeline({ ...params, ...paginationParams }),
    { stream: 'bubble' },
  );
};

const useAntennaTimeline = (
  antennaId: string,
  params?: Omit<AntennaTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(queryKeys.timelines.antenna(antennaId, params), (paginationParams) =>
    client.timelines.antennaTimeline(antennaId, { ...params, ...paginationParams }),
  );
};

const useWrenchedTimeline = (params?: Omit<WrenchedTimelineParams, keyof PaginationParams>) => {
  const client = useClient();

  return useTimeline(queryKeys.timelines.wrenched(params), (paginationParams) =>
    client.timelines.wrenchedTimeline({ ...params, ...paginationParams }),
  );
};

export {
  useHomeTimeline,
  usePublicTimeline,
  useHashtagTimeline,
  useLinkTimeline,
  useListTimeline,
  useGroupTimeline,
  useBubbleTimeline,
  useAntennaTimeline,
  useWrenchedTimeline,
};
