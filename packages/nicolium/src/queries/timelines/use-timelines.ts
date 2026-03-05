import { useClient } from '@/hooks/use-client';

import { useTimeline } from './use-timeline';

import type {
  AntennaTimelineParams,
  BubbleTimelineParams,
  GetAccountStatusesParams,
  GetCircleStatusesParams,
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
    'home',
    (paginationParams) => client.timelines.homeTimeline({ ...params, ...paginationParams }),
    { stream },
  );
};

const usePublicTimeline = (params?: Omit<PublicTimelineParams, keyof PaginationParams>) => {
  const client = useClient();
  const stream = params?.local ? 'public:local' : params?.instance ? `public:remote` : 'public';

  return useTimeline(
    `public${params?.local ? ':local' : params?.instance ? `:remote:` + params.instance : ''}`,
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
    `hashtag:${hashtag}`,
    (paginationParams) =>
      client.timelines.hashtagTimeline(hashtag, {
        ...params,
        ...paginationParams,
      }),
    { stream: 'hashtag', params: { tag: hashtag } },
  );
};

const useLinkTimeline = (
  url: string,
  params?: Omit<LinkTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(`link:${url}`, (paginationParams) =>
    client.timelines.linkTimeline(url, { ...params, ...paginationParams }),
  );
};

const useListTimeline = (
  listId: string,
  params?: Omit<ListTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(
    `list:${listId}`,
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
    `group:${groupId}`,
    (paginationParams) =>
      client.timelines.groupTimeline(groupId, {
        ...params,
        ...paginationParams,
      }),
    { stream: 'group', params: { group: groupId } },
  );
};

const useBubbleTimeline = (params?: Omit<BubbleTimelineParams, keyof PaginationParams>) => {
  const client = useClient();

  return useTimeline(
    `bubble`,
    (paginationParams) => client.timelines.bubbleTimeline({ ...params, ...paginationParams }),
    { stream: 'bubble' },
  );
};

const useAntennaTimeline = (
  antennaId: string,
  params?: Omit<AntennaTimelineParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(`antenna:${antennaId}`, (paginationParams) =>
    client.timelines.antennaTimeline(antennaId, {
      ...params,
      ...paginationParams,
    }),
  );
};

const useCircleTimeline = (
  circleId: string,
  params?: Omit<GetCircleStatusesParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(`circle:${circleId}`, (paginationParams) =>
    client.circles.getCircleStatuses(circleId, {
      ...params,
      ...paginationParams,
    }),
  );
};

const useWrenchedTimeline = (params?: Omit<WrenchedTimelineParams, keyof PaginationParams>) => {
  const client = useClient();

  return useTimeline('wrenched', (paginationParams) =>
    client.timelines.wrenchedTimeline({ ...params, ...paginationParams }),
  );
};

const useAccountTimeline = (
  accountId: string,
  params?: Omit<GetAccountStatusesParams, keyof PaginationParams>,
) => {
  const client = useClient();

  return useTimeline(
    `account:${accountId}${params?.exclude_replies ? ':exclude_replies' : ''}`,
    (paginationParams) =>
      client.accounts.getAccountStatuses(accountId, {
        ...params,
        ...paginationParams,
      }),
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
  useCircleTimeline,
  useWrenchedTimeline,
  useAccountTimeline,
};
