import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { useAppQuery } from '../query';
import { useImportEntities } from '../utils/import-entities';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import {
  minifyNotificationRequest,
  minifyNotificationRequests,
  minifyNotifications,
} from '../utils/minify-list';

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

const useNotificationRequest = (requestId: string) => {
  const client = useClient();
  const features = useFeatures();
  const importEntities = useImportEntities();

  return useAppQuery({
    queryKey: queryKeys.notifications.notificationRequests.one(requestId),
    queryFn: () =>
      client.notifications.getNotificationRequest(requestId).then((response) => {
        importEntities({ accounts: [response.account], statuses: [response.last_status] });
        return minifyNotificationRequest(response);
      }),
    enabled: features.notificationsPolicy,
  });
};

const useAcceptNotificationRequestMutation = (requestId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['notifications', 'requests', requestId],
    mutationFn: () => client.notifications.acceptNotificationRequest(requestId),
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.root],
      });
      queryClient.resetQueries({
        queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.one(requestId)],
      });
    },
  });
};

const useDismissNotificationRequestMutation = (requestId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['notifications', 'requests', requestId],
    mutationFn: () => client.notifications.dismissNotificationRequest(requestId),
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.root],
      });
      queryClient.resetQueries({
        queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.one(requestId)],
      });
    },
  });
};

const useNotificationsFromAccount = makePaginatedResponseQuery(
  (accountId: string | undefined) => queryKeys.notifications.fromAccount(accountId!),
  (client, [accountId], scopeUrl) =>
    client.notifications
      .getNotifications({
        account_id: accountId,
      })
      .then((response) => minifyNotifications(response, scopeUrl)),
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
