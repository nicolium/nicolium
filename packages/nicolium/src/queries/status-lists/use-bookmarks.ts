import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useBookmarks = makePaginatedResponseQuery(
  (folderId?: string) => queryKeys.statusLists.bookmarks(folderId),
  (client, [folder_id], scopeUrl) =>
    client.myAccount
      .getBookmarks({ folder_id })
      .then((response) => minifyStatusList(response, scopeUrl)),
);

export { useBookmarks };
