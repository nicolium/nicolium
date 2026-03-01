import { type InfiniteData, useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';

import { queryKeys } from '../keys';

import type { InteractionRequest, PaginatedResponse } from 'pl-api';

const minifyInteractionRequest = ({
  account,
  status,
  reply,
  ...interactionRequest
}: InteractionRequest) => ({
  account_id: account.id,
  status_id: status?.id ?? null,
  reply_id: reply?.id ?? null,
  ...interactionRequest,
});

type MinifiedInteractionRequest = ReturnType<typeof minifyInteractionRequest>;

const minifyInteractionRequestsList = ({
  previous,
  next,
  items,
  ...response
}: PaginatedResponse<InteractionRequest>): PaginatedResponse<MinifiedInteractionRequest> => {
  importEntities({ statuses: items.flatMap((item) => [item.status, item.reply]) });

  return {
    ...response,
    previous: previous ? () => previous().then(minifyInteractionRequestsList) : null,
    next: next ? () => next().then(minifyInteractionRequestsList) : null,
    items: items.map(minifyInteractionRequest),
  };
};

const useInteractionRequests = <T>(
  select?: (data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) => T,
) => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useInfiniteQuery({
    queryKey: queryKeys.interactionRequests.all,
    queryFn: ({ pageParam }) =>
      pageParam.next?.() ??
      client.interactionRequests.getInteractionRequests().then(minifyInteractionRequestsList),
    initialPageParam: {
      previous: null,
      next: null,
      items: [],
      partial: false,
    } as PaginatedResponse<MinifiedInteractionRequest>,
    getNextPageParam: (page) => (page.next ? page : undefined),
    enabled: isLoggedIn && features.interactionRequests,
    select,
  });
};

const useFlatInteractionRequests = () =>
  useInteractionRequests((data: InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>) =>
    data.pages.flatMap((page) => page.items),
  );

const useInteractionRequestsCount = () =>
  useInteractionRequests((data) => data.pages.flatMap(({ items }) => items).length);

const useAuthorizeInteractionRequestMutation = (requestId: string) => {
  const client = useClient();
  const { refetch } = useInteractionRequests();

  return useMutation({
    mutationKey: ['interactionRequests', requestId],
    mutationFn: () => client.interactionRequests.authorizeInteractionRequest(requestId),
    onSettled: () => refetch(),
  });
};

const useRejectInteractionRequestMutation = (requestId: string) => {
  const client = useClient();
  const { refetch } = useInteractionRequests();

  return useMutation({
    mutationKey: ['interactionRequests', requestId],
    mutationFn: () => client.interactionRequests.rejectInteractionRequest(requestId),
    onSettled: () => refetch(),
  });
};

export {
  useInteractionRequests,
  useInteractionRequestsCount,
  useFlatInteractionRequests,
  useAuthorizeInteractionRequestMutation,
  useRejectInteractionRequestMutation,
  type MinifiedInteractionRequest,
};
