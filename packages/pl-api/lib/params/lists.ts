import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface CreateListParams {
  /** String. The title of the list to be created. */
  title: string;
  /** String. One of followed, list, or none. Defaults to list. */
  replies_policy?: 'followed' | 'list' | 'none';
  /** Boolean. Whether members of this list need to get removed from the “Home” feed */
  exclusive?: boolean;
  /**
   * Boolean. Whether to receive notifications for new posts in the list.
   * Requires features{@link Features['listsNotifications']}
  */
  notify?: boolean;
  /**
   * Boolean. Whether the list should appear in the navigation bar.
   * Requires features{@link Features['listsFavourites']}
  */
  favourite?: boolean;
}

/**
 * @category Request params
 */
type UpdateListParams = Partial<CreateListParams>;

/**
 * @category Request params
 */
type GetListAccountsParams = PaginationParams;

export type {
  CreateListParams,
  UpdateListParams,
  GetListAccountsParams,
};
