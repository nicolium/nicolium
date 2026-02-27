import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

const useFollowers = makePaginatedResponseQuery(
  (accountId?: string) => queryKeys.accountsLists.followers(accountId!),
  (client, [accountId]) =>
    client.accounts
      .getAccountFollowers(accountId!, { with_relationships: true })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

const useFollowing = makePaginatedResponseQuery(
  (accountId?: string) => queryKeys.accountsLists.following(accountId!),
  (client, [accountId]) =>
    client.accounts
      .getAccountFollowing(accountId!, { with_relationships: true })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

const useSubscribers = makePaginatedResponseQuery(
  (accountId?: string, includeExpired?: boolean) =>
    queryKeys.accountsLists.subscribers(accountId!, includeExpired ?? false),
  (client, [accountId, includeExpired]) =>
    client.accounts
      .getAccountSubscribers(accountId!, {
        include_expired: includeExpired,
        with_relationships: true,
      })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

export { useFollowers, useFollowing, useSubscribers };
