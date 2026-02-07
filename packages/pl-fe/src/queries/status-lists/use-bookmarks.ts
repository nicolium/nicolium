import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

const useBookmarks = makePaginatedResponseQuery(
  (folderId?: string) => ['statusLists', 'bookmarks', folderId],
  (client, [folder_id]) => client.myAccount.getBookmarks({ folder_id }).then(minifyStatusList),
);

export { useBookmarks };
