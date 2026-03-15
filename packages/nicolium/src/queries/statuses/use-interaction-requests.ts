import { type InfiniteData, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { type InteractionRequest, PaginatedResponse } from 'pl-api';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { importEntities } from '@/queries/utils/import-entities';

import { queryKeys } from '../keys';

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

  return new PaginatedResponse(items.map(minifyInteractionRequest), {
    ...response,
    previous: previous ? () => previous().then(minifyInteractionRequestsList) : null,
    next: next ? () => next().then(minifyInteractionRequestsList) : null,
  });
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
      next: null as (() => Promise<PaginatedResponse<MinifiedInteractionRequest>>) | null,
    },
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
