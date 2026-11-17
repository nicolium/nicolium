import { useMutation } from '@tanstack/react-query';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey, useAppQuery } from '../query';
import { importEntities } from '../utils/import-entities';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import {
  minifyList,
  minifyNotificationRequest,
  minifyNotificationRequests,
} from '../utils/minify-list';

import { normalizeNotification } from './use-notifications';

const useNotificationRequests = makePaginatedResponseQuery(
  queryKeys.notifications.notificationRequests.root,
  (client, _, scopeUrl) =>
    client.notifications
      .getNotificationRequests()
      .then((response) => minifyNotificationRequests(response, scopeUrl)),
  undefined,
  undefined,
  undefined,
  'notificationsPolicy',
);

const useNotificationRequest = (requestId?: string) => {
  const client = useClient();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.notifications.notificationRequests.one(requestId!),
    queryFn: () =>
      client.notifications.getNotificationRequest(requestId!).then((response) => {
        importEntities(scopeUrl, {
          accounts: [response.account],
          statuses: response.last_status ? [response.last_status] : [],
        });
        return minifyNotificationRequest(response);
      }),
    enabled: !!requestId && features.notificationsPolicy,
  });
};

const resetNotificationRequests = (requestId: string, scopeUrl: string) => {
  queryClient.resetQueries({
    queryKey: scopedQueryKey(queryKeys.notifications.notificationRequests.root, scopeUrl),
  });
  queryClient.resetQueries({
    queryKey: scopedQueryKey(queryKeys.notifications.notificationRequests.one(requestId), scopeUrl),
  });
  queryClient.invalidateQueries({
    queryKey: scopedQueryKey(queryKeys.notifications.notificationPolicy, scopeUrl),
  });
};

const useAcceptNotificationRequestMutation = (requestId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['notifications', 'requests', requestId],
    mutationFn: () => client.notifications.acceptNotificationRequest(requestId),
    onSuccess: () => resetNotificationRequests(requestId, scopeUrl),
  });
};

const useDismissNotificationRequestMutation = (requestId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['notifications', 'requests', requestId],
    mutationFn: () => client.notifications.dismissNotificationRequest(requestId),
    onSuccess: () => resetNotificationRequests(requestId, scopeUrl),
  });
};

const useNotificationsFromAccount = makePaginatedResponseQuery(
  (accountId: string | undefined) => queryKeys.notifications.fromAccount(accountId!),
  (client, [accountId], scopeUrl) =>
    client.notifications.getNotifications({ account_id: accountId }).then((response) =>
      minifyList(response, (notification) => {
        importEntities(scopeUrl, {
          accounts:
            'target' in notification
              ? [notification.account, notification.target]
              : [notification.account],
          statuses: 'status' in notification && notification.status ? [notification.status] : [],
        });

        return normalizeNotification(notification);
      }),
    ),
  undefined,
  (accountId) => !!accountId,
);

export {
  useNotificationRequests,
  useNotificationRequest,
  useAcceptNotificationRequestMutation,
  useDismissNotificationRequestMutation,
  useNotificationsFromAccount,
};
