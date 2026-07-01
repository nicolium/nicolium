/**
 * @category Request params
 */
interface GetCollectionsParams {
  /** Integer. Maximum number of results. Defaults to 40 Collections. Max 80. */
  limit?: number;
  /** Integer. Skip the first n results. Defaults to 0. */
  offset?: number;
}

/**
 * @category Request params
 */
interface CreateCollectionParams {
  /** A name for this Collection, max. 40 characters. */
  name: string;
  /** A longer description of this Collection, max. 100 characters. */
  description?: string;
  /** One of Mastodon's supported language codes. */
  language?: string;
  /** A single hashtag that describes the Collection. */
  tag_name?: string;
  /** Whether this Collection should be marked as sensitive. */
  sensitive?: boolean;
  /** Whether this Collection should appear on the user's profile, in search results and other discovery mechanisms. */
  discoverable?: boolean;
  /** IDs of the accounts to feature in this Collection. */
  account_ids?: string[];
}

/**
 * @category Request params
 */
type UpdateCollectionParams = Omit<Partial<CreateCollectionParams>, 'account_ids'>;

export type { GetCollectionsParams, CreateCollectionParams, UpdateCollectionParams };
