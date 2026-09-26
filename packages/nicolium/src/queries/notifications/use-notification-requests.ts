import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyNotificationRequests } from '../utils/minify-list';

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

export { useNotificationRequests };
