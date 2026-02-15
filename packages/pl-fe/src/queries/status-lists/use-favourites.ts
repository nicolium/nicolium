import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

const useFavourites = makePaginatedResponseQuery(
  (accountId?: string) => ['statusLists', 'favourites', accountId],
  (client, [accountId]) =>
    (accountId
      ? client.accounts.getAccountFavourites(accountId)
      : client.myAccount.getFavourites()
    ).then(minifyStatusList),
);

export { useFavourites };
