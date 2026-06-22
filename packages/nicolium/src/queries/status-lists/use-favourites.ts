import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useFavourites = makePaginatedResponseQuery(
  (accountId?: string) => queryKeys.statusLists.favourites(accountId!),
  (client, [accountId], accountOrInstanceUrl) =>
    (accountId
      ? client.accounts.getAccountFavourites(accountId)
      : client.myAccount.getFavourites()
    ).then((response) => minifyStatusList(response, accountOrInstanceUrl)),
);

export { useFavourites };
