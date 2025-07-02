import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyStatusList } from 'pl-fe/queries/utils/minify-list';

const useFavourites = makePaginatedResponseQuery(
  (accountId?: string) => ['statusLists', 'favourites', accountId],
  (client, [accountId]) => (accountId ? client.accounts.getAccountFavourites(accountId) : client.myAccount.getFavourites()).then(minifyStatusList),
);

export { useFavourites };
