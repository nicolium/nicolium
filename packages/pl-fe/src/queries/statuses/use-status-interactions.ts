import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';

import type { InteractionsAction } from 'pl-fe/actions/interactions';

const queryKey = {
  getDislikedBy: 'statusDislikes',
  getFavouritedBy: 'statusFavourites',
  getRebloggedBy: 'statusReblogs',
};

const makeUseStatusInteractions = (method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => makePaginatedResponseQuery(
  (statusId: string) => ['accountsLists', queryKey[method], statusId],
  (client, params) => client.statuses[method](...params).then(minifyAccountList),
);

const useStatusDislikes = makeUseStatusInteractions('getDislikedBy');
const useStatusFavourites = makeUseStatusInteractions('getFavouritedBy');
const useStatusReblogs = makeUseStatusInteractions('getRebloggedBy');

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
    queryFn: () => client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
      dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

      return reactions.map(({ accounts, ...reactions }) => reactions);
    }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  });
};

const useFavouriteStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'favourite', statusId],
    mutationFn: () => client.statuses.favouriteStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'FAVOURITE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'UNFAVOURITE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusFavourites', statusId] });
    },
  });
};

const useUnfavouriteStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'favourite', statusId],
    mutationFn: () => client.statuses.unfavouriteStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNFAVOURITE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'FAVOURITE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusFavourites', statusId] });
    },
  });
};

const useDislikeStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'dislike', statusId],
    mutationFn: () => client.statuses.dislikeStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'DISLIKE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'UNDISLIKE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusDislikes', statusId] });
    },
  });
};

const useUndislikeStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'dislike', statusId],
    mutationFn: () => client.statuses.undislikeStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNDISLIKE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'DISLIKE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusDislikes', statusId] });
    },
  });
};

const useReblogStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'reblog', statusId],
    mutationFn: (visibility?: string) => client.statuses.reblogStatus(statusId, visibility),
    onMutate: () => dispatch<InteractionsAction>({ type: 'REBLOG_REQUEST', statusId }),
    onError: (error) => dispatch<InteractionsAction>({ type: 'REBLOG_FAIL', statusId, error }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusReblogs', statusId] });
    },
  });
};

const useUnreblogStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'reblog', statusId],
    mutationFn: () => client.statuses.unreblogStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNREBLOG_REQUEST', statusId }),
    onError: (error) => dispatch<InteractionsAction>({ type: 'UNREBLOG_FAIL', statusId, error }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusReblogs', statusId] });
    },
  });
};

export {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReactions,
  useStatusReblogs,
  useFavouriteStatus,
  useUnfavouriteStatus,
  useDislikeStatus,
  useUndislikeStatus,
  useReblogStatus,
  useUnreblogStatus,
};
