import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

const useFollowers = makePaginatedResponseQuery(
  (accountId?: string) => ['accountsLists', 'followers', accountId],
  (client, [accountId]) =>
    client.accounts
      .getAccountFollowers(accountId!, { with_relationships: true })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

const useFollowing = makePaginatedResponseQuery(
  (accountId?: string) => ['accountsLists', 'following', accountId],
  (client, [accountId]) =>
    client.accounts
      .getAccountFollowing(accountId!, { with_relationships: true })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

const useSubscribers = makePaginatedResponseQuery(
  (accountId?: string) => ['accountsLists', 'subscribers', accountId],
  (client, [accountId]) =>
    client.accounts
      .getAccountSubscribers(accountId!, { with_relationships: true })
      .then(minifyAccountList),
  undefined,
  (accountId) => !!accountId,
);

export { useFollowers, useFollowing, useSubscribers };
