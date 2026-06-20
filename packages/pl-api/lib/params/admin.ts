import type { PaginationParams } from './common';

/**
 * @category Request params
 */
interface AdminGetAccountsParams extends PaginationParams {
  /** String. Filter for `local` or `remote` accounts. */
  origin?: 'local' | 'remote';
  /** String. Filter for `active`, `pending`, `disabled`, `silenced`, or suspended accounts. */
  status?: 'active' | 'pending' | 'disabled' | 'silenced' | 'suspended';
  /** String. Filter for accounts with `staff` permissions (users that can manage reports). */
  permissions?: 'staff';
  /** Array of String. Filter for users with these roles. */
  role_ids?: string[];
  /** String. Lookup users invited by the account with this ID. */
  invited_by?: string;
  /** String. Search for the given username. */
  username?: string;
  /** String. Search for the given display name */
  display_name?: string;
  /** String. Filter by the given domain */
  by_domain?: string;
  /** String. Lookup a user with this email */
  email?: string;
  /** String. Lookup users with this IP address */
  ip?: string;
}

/**
 * @category Request params
 */
interface AdminCreateAccountParams {
  nickname: string;
  email: string;
  password: string;
}

/**
 * @category Request params
 */
type AdminAccountAction = 'none' | 'sensitive' | 'disable' | 'silence' | 'suspend';

/**
 * @category Request params
 */
interface AdminAccountUpdateCredentialsParams {
  email?: string;
  password?: string;
  /** String. The display name to use for the profile. */
  name?: string;
  /** String. The account bio. */
  bio?: string;
  /** Avatar image encoded using `multipart/form-data` */
  avatar?: File | '';
  /** Boolean. Whether manual approval of follow requests is required. */
  locked?: boolean;
  /** if true, html tags are stripped from all statuses requested from the API */
  no_rich_text?: boolean;
  /** the scope returned under privacy key in Source subentity */
  default_scope?: string;
  /** Header image encoded using `multipart/form-data` */
  header?: File | '';
  /** if true, user's follows will be hidden */
  hide_follows?: boolean;
  /** if true, user's followers will be hidden*/
  hide_followers?: boolean;
  /** if true, user's follower count will be hidden */
  hide_followers_count?: boolean;
  /** if true, user's follow count will be hidden */
  hide_follows_count?: boolean;
  /** if true, user's favorites timeline will be hidden */
  hide_favorites?: boolean;
  /** if true, allows automatically follow moved following accounts */
  allow_following_move?: boolean;
  /** if true, user's role (e.g admin, moderator) will be exposed to anyone in the API */
  show_role?: boolean;
  /** if true, skip filtering out broken threads */
  skip_thread_containment?: boolean;
  /** Hash. The profile fields to be set. Inside this hash, the key is an integer cast to a string (although the exact integer does not matter), and the value is another hash including name and value. By default, max 4 fields. */
  fields?: Record<
    string,
    {
      /** String. The name of the profile field. By default, max 255 characters. */
      name: string;
      /** String. The value of the profile field. By default, max 255 characters. */
      value: string;
    }
  >;
  /**
   * Boolean. Whether the account should be shown in the profile directory.
   * Requires features{@link Features.accountDiscoverability}
   */
  discoverable?: boolean;
  actor_type?: 'Person' | 'Service';
}

/**
 * @category Request params
 */
interface AdminPerformAccountActionParams {
  /** String. The ID of an associated report that caused this action to be taken. */
  report_id?: string;
  /** String. The ID of a preset warning. */
  warning_preset_id?: string;
  /** String. Additional clarification for why this action was taken. */
  text?: string;
  /** Boolean. Should an email be sent to the user with the above information? */
  send_email_notification?: boolean;
}

/**
 * @category Request params
 */
type AdminGetDomainBlocksParams = PaginationParams;

/**
 * @category Request params
 */
interface AdminCreateDomainBlockParams {
  /** String. Whether to apply a `silence`, `suspend`, or `noop` to the domain. Defaults to `silence` */
  severity?: 'silence' | 'suspend' | 'noop';
  /** Boolean. Whether media attachments should be rejected. Defaults to false */
  reject_media?: boolean;
  /** Boolean. Whether reports from this domain should be rejected. Defaults to false */
  reject_reports?: boolean;
  /** String. A private note about this domain block, visible only to admins. */
  private_comment?: string;
  /** String. A public note about this domain block, optionally shown on the about page. */
  public_comment?: string;
  /** Boolean. Whether to partially censor the domain when shown in public. Defaults to false */
  obfuscate?: boolean;
}

/**
 * @category Request params
 */
type AdminUpdateDomainBlockParams = AdminCreateDomainBlockParams;

/**
 * @category Request params
 */
interface AdminGetReportsParams extends PaginationParams {
  /** Boolean. Filter for resolved reports? */
  resolved?: boolean;
  /** Boolean. Filter for open reports? */
  unresolved?: boolean;
  /** String. Filter for reports filed by this account. */
  account_id?: string;
  /** String. Filter for reports targeting this account. */
  target_account_id?: string;
}

/**
 * @category Request params
 */
interface AdminUpdateReportParams {
  /** String. Change the classification of the report to `spam`, `legal`, `violation`, or `other`. */
  category?: 'spam' | 'legal' | 'violation' | 'other';
  /** Array of Integer. For `violation` category reports, specify the ID of the exact rules broken. Rules and their IDs are available via [GET /api/v1/instance/rules](https://docs.joinmastodon.org/methods/instance/#rules) and [GET /api/v1/instance](https://docs.joinmastodon.org/methods/instance/#get). */
  rule_ids?: string[];
}

/**
 * @category Request params
 */
interface AdminGetStatusesParams {
  limit?: number;
  local_only?: boolean;
  with_reblogs?: boolean;
  with_private?: boolean;
}

/**
 * @category Request params
 */
interface AdminUpdateStatusParams {
  sensitive?: boolean;
  visibility?: 'public' | 'private' | 'unlisted';
}

/**
 * @category Request params
 */
type AdminGetCanonicalEmailBlocks = PaginationParams;

/**
 * @category Request params
 */
type AdminDimensionKey =
  | 'languages'
  | 'sources'
  | 'servers'
  | 'space_usage'
  | 'software_versions'
  | 'tag_servers'
  | 'tag_languages'
  | 'instance_accounts'
  | 'instance_languages';

/**
 * @category Request params
 */
interface AdminGetDimensionsParams {
  /** String (ISO 8601 Datetime). The start date for the time period. If a time is provided, it will be ignored. */
  start_at?: string;
  /** String (ISO 8601 Datetime). The end date for the time period. If a time is provided, it will be ignored. */
  end_at?: string;
  /** Integer. The maximum number of results to return for sources, servers, languages, tag or instance dimensions. */
  limit?: number;
  tag_servers?: {
    /** String. When tag_servers is one of the requested keys, you must provide a trending tag ID to obtain information about which servers are posting the tag. */
    id?: string;
  };
  tag_languages?: {
    /** String. When tag_languages is one of the requested keys, you must provide a trending tag ID to obtain information about which languages are posting the tag. */
    id?: string;
  };
  instance_accounts?: {
    /** String. When instance_accounts is one of the requested keys, you must provide a domain to obtain information about popular accounts from that server. */
    domain?: string;
  };
  instance_languages?: {
    /** String. When instance_accounts is one of the requested keys, you must provide a domain to obtain information about popular languages from that server. */
    domain?: string;
  };
}

/**
 * @category Request params
 */
type AdminGetDomainAllowsParams = PaginationParams;

/**
 * @category Request params
 */
type AdminGetEmailDomainBlocksParams = PaginationParams;

/**
 * @category Request params
 */
type AdminGetIpBlocksParams = PaginationParams;

/**
 * @category Request params
 */
interface AdminCreateIpBlockParams {
  /** String. The IP address and prefix to block. Defaults to 0.0.0.0/32 */
  ip?: string;
  /** String. The policy to apply to this IP range: sign_up_requires_approval, sign_up_block, or no_access */
  severity: string;
  /** String. The reason for this IP block. */
  comment?: string;
  /** Integer. The number of seconds in which this IP block will expire. */
  expires_in?: number;
}

/**
 * @category Request params
 */
type AdminUpdateIpBlockParams = Partial<AdminCreateIpBlockParams>;

/**
 * @category Request params
 */
type AdminMeasureKey =
  | 'active_users'
  | 'new_users'
  | 'interactions'
  | 'opened_reports'
  | 'resolved_reports'
  | 'tag_accounts'
  | 'tag_uses'
  | 'tag_servers'
  | 'instance_accounts'
  | 'instance_media_attachments'
  | 'instance_reports'
  | 'instance_statuses'
  | 'instance_follows'
  | 'instance_followers';

/**
 * @category Request params
 */
interface AdminGetMeasuresParams {
  tag_accounts?: {
    /** String. When `tag_accounts` is one of the requested keys, you must provide a tag ID to obtain the measure of how many accounts used that hashtag in at least one status within the given time period. */
    id?: string;
  };
  tag_uses?: {
    /** String. When `tag_uses` is one of the requested keys, you must provide a tag ID to obtain the measure of how many statuses used that hashtag within the given time period. */
    id?: string;
  };
  tag_servers?: {
    /** String. When `tag_servers` is one of the requested keys, you must provide a tag ID to obtain the measure of how many servers used that hashtag in at least one status within the given time period. */
    id?: string;
  };
  instance_accounts?: {
    /** String. When `instance_accounts` is one of the requested keys, you must provide a remote domain to obtain the measure of how many accounts have been discovered from that server within the given time period. */
    domain?: string;
  };
  instance_media_attachments?: {
    /** String. When `instance_media_attachments` is one of the requested keys, you must provide a remote domain to obtain the measure of how much space is used by media attachments from that server within the given time period. */
    domain?: string;
  };
  instance_reports?: {
    /** String. When `instance_reports` is one of the requested keys, you must provide a remote domain to obtain the measure of how many reports have been filed against accounts from that server within the given time period. */
    domain?: string;
  };
  instance_statuses?: {
    /** String. When `instance_statuses` is one of the requested keys, you must provide a remote domain to obtain the measure of how many statuses originate from that server within the given time period. */
    domain?: string;
  };
  instance_follows?: {
    /** String. When `instance_follows` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed on accounts from that server by local accounts within the given time period. */
    domain?: string;
  };
  instance_followers?: {
    /** String. When `instance_followers` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed by accounts from that server on local accounts within the given time period. */
    domain?: string;
  };
}

/**
 * @category Request params
 */
interface AdminGetAnnouncementsParams {
  offset?: number;
  limit?: number;
}

/**
 * @category Request params
 */
interface AdminCreateAnnouncementParams {
  /** announcement content */
  content: string;
  /** datetime, optional, default to null, the time when the announcement will become active (displayed to users); if it is null, the announcement will be active immediately */
  starts_at?: string;
  /** datetime, optional, default to null, the time when the announcement will become inactive (no longer displayed to users); if it is null, the announcement will be active until an admin deletes it */
  ends_at?: string;
  /** boolean, optional, default to false, tells the client whether to only display dates for `starts_at` and `ends_at` */
  all_day?: boolean;
}

/**
 * @category Request params
 */
type AdminUpdateAnnouncementParams = Partial<AdminCreateAnnouncementParams>;

/**
 * @category Request params
 */
interface AdminCreateDomainParams {
  /** domain name */
  domain: string;
  /** defaults to false, whether it is possible to register an account under the domain by everyone */
  public?: boolean;
}

/**
 * @category Request params
 */
interface AdminGetModerationLogParams extends Pick<PaginationParams, 'limit'> {
  /** page number */
  page?: number;
  /** datetime (ISO 8601) filter logs by creation date, start from start_date. Accepts datetime in ISO 8601 format (YYYY-MM-DDThh:mm:ss), e.g. 2005-08-09T18:31:42 */
  start_date?: string;
  /** datetime (ISO 8601) filter logs by creation date, end by from end_date. Accepts datetime in ISO 8601 format (YYYY-MM-DDThh:mm:ss), e.g. 2005-08-09T18:31:42 */
  end_date?: string;
  /** filter logs by actor's id */
  user_id?: string;
  /** search logs by the log message */
  search?: string;
}

/**
 * @category Request params
 */
interface AdminCreateRuleParams {
  text: string;
  hint?: string;
  priority?: number;
}

/**
 * @category Request params
 */
type AdminUpdateRuleParams = Partial<AdminCreateRuleParams>;

/**
 * @category Request params
 */
interface AdminGetCustomEmojisParams extends Pick<PaginationParams, 'limit'> {
  filter?: string;
  max_shortcode_domain?: string;
  min_shortcode_domain?: string;
}

interface AdminCreateCustomEmojiParams {
  shortcode: string;
  image: File;
  category?: string;
}

interface AdminUpdateCustomEmojiParams {
  type: 'disable' | 'copy' | 'modify';
  shortcode?: string;
  image?: File;
  category?: string;
}

/**
 * @category Request params
 */
type AdminDomainLimitMediaPolicy = 'no_action' | 'mark_sensitive' | 'reject';

/**
 * @category Request params
 */
type AdminDomainLimitFollowsPolicy =
  | 'no_action'
  | 'manual_approval'
  | 'reject_non_mutual'
  | 'reject_all';

/**
 * @category Request params
 */
type AdminDomainLimitStatusesPolicy = 'no_action' | 'filter_warn' | 'filter_hide';

/**
 * @category Request params
 */
type AdminDomainLimitAccountsPolicy = 'no_action' | 'mute';

/**
 * @category Request params
 */
type AdminGetDomainLimitsParams = PaginationParams;

/**
 * @category Request params
 */
interface AdminCreateDomainLimitParams {
  /** Hostname of the domain to limit. */
  domain: string;
  /** Policy to apply to media from the limited domain. Defaults to `no_action`. */
  media_policy?: AdminDomainLimitMediaPolicy;
  /** Policy to apply to follow (requests) originating from the limited domain. Defaults to `no_action`. */
  follows_policy?: AdminDomainLimitFollowsPolicy;
  /** Policy to apply to statuses of non-followed accounts on the limited domain. Defaults to `no_action`. */
  statuses_policy?: AdminDomainLimitStatusesPolicy;
  /** Policy to apply to non-followed accounts on the limited domain. Defaults to `no_action`. */
  accounts_policy?: AdminDomainLimitAccountsPolicy;
  /** Content warning to prepend to posts from accounts on this instance. */
  content_warning?: string;
  /** Public comment about this domain limit. This will be displayed alongside the domain limit if you choose to share limits. */
  public_comment?: string;
  /** Private comment about this domain limit. Will only be shown to other admins, so this is a useful way of internally keeping track of why a certain domain ended up limited. */
  private_comment?: string;
}

/**
 * @category Request params
 */
type AdminUpdateDomainLimitParams = Partial<Omit<AdminCreateDomainLimitParams, 'domain'>>;

/**
 * @category Request params
 */
interface AdminGetDomainPermissionDraftsParams extends PaginationParams {
  /** Show only drafts created by the given subscription ID. */
  subscription_id?: string;
  /** Return only drafts that target the given domain. */
  domain?: string;
  /** Filter on "block" or "allow" type drafts. */
  permission_type?: 'block' | 'allow';
}

/**
 * @category Request params
 */
interface AdminCreateDomainPermissionDraftParams {
  /** Domain to create the permission draft for. */
  domain?: string;
  /** Create a draft "allow" or a draft "block". */
  permission_type?: 'block' | 'allow';
  /** Obfuscate the name of the domain when serving it publicly. Eg., `example.org` becomes something like `ex***e.org`. */
  obfuscate?: boolean;
  /** Public comment about this domain permission. This will be displayed alongside the domain permission if you choose to share permissions. */
  public_comment?: string;
  /** Private comment about this domain permission. Will only be shown to other admins, so this is a useful way of internally keeping track of why a certain domain ended up permissioned. */
  private_comment?: string;
}

/**
 * @category Request params
 */
interface AdminGetDomainPermissionExcludesParams extends PaginationParams {
  /** Return only excludes that target the given domain. */
  domain?: string;
}

/**
 * @category Request params
 */
interface AdminCreateDomainPermissionExcludeParams {
  /** Domain to create the permission exclude for. */
  domain?: string;
  /** Private comment about this domain exclude. */
  private_comment?: string;
}

/**
 * @category Request params
 */
interface AdminGetDomainPermissionSubscriptionsParams extends PaginationParams {
  /** Filter on "block" or "allow" type subscriptions. */
  permission_type?: 'block' | 'allow';
}

/**
 * @category Request params
 */
interface AdminCreateDomainPermissionSubscriptionParams {
  /** Priority of this subscription compared to others of the same permission type. 0-255 (higher = higher priority). Higher priority subscriptions will overwrite permissions generated by lower priority subscriptions. When two subscriptions have the same `priority` value, priority is indeterminate, so it's recommended to always set this value manually. Defaults to 0. */
  priority?: number;
  /** Optional title for this subscription. */
  title?: string;
  /** Type of permissions to create by parsing the targeted file/list. One of "allow" or "block". */
  permission_type: 'block' | 'allow';
  /** If true, domain permissions arising from this subscription will be created as drafts that must be approved by a moderator to take effect. If false, domain permissions from this subscription will come into force immediately. Defaults to "true". */
  as_draft?: boolean;
  /** If true, this domain permission subscription will "adopt" domain permissions which already exist on the instance, and which meet the following conditions: 1) they have no subscription ID (ie., they're "orphaned") and 2) they are present in the subscribed list. Such orphaned domain permissions will be given this subscription's subscription ID value and be managed by this subscription. Defaults to false. */
  adopt_orphans?: boolean;
  /** If true, then when a list is processed, if the list does not contain entries that it *did* contain previously, ie., retracted entries, then domain permissions corresponding to those entries will be removed. If false, they will just be orphaned instead. Defaults to true. */
  remove_retracted?: boolean;
  /** URI to call in order to fetch the permissions list. */
  uri: string;
  /** MIME content type to use when parsing the permissions list. One of "text/plain", "text/csv", and "application/json". */
  content_type: 'text/plain' | 'text/csv' | 'application/json';
  /** Optional basic auth username to provide when fetching given uri. If set, will be transmitted along with `fetch_password` when doing the fetch. */
  fetch_username?: string;
  /** Optional basic auth password to provide when fetching given uri. If set, will be transmitted along with `fetch_username` when doing the fetch. */
  fetch_password?: string;
}

/**
 * @category Request params
 */
type AdminUpdateDomainPermissionSubscriptionParams = Partial<
  Omit<AdminCreateDomainPermissionSubscriptionParams, 'permission_type'>
>;

/**
 * @category Request params
 */
interface AdminGetInstancesParams extends PaginationParams {
  /** Filter by the given domain. */
  domain?: string;
  /** Order by default "first_seen" (newest -> oldest) or "alphabetical" (a -> z). Defaults to `first_seen`. */
  order?: 'first_seen' | 'alphabetical';
  /** Only include instances that have one or more delivery errors since the last successful delivery. */
  with_errors_only?: boolean;
}

/**
 * @category Request params
 */
interface AdminCreateHeaderFilterParams {
  /** The HTTP header to match against (e.g. `User-Agent`). */
  header: string;
  /** The header value matching regular expression. */
  regex: string;
}

/**
 * @category Request params
 */
interface AdminUpdateRelaySubscriptionParams {
  // /** The ActivityPub URI of the remote relay actor. */
  // relay_actor_uri: string;
  /** Ingest public posts. If false, never ingest public posts via this subscription. Defaults to true. */
  public?: boolean;
  /** Ingest unlisted posts. If false, never ingest unlisted posts via this subscription. */
  unlisted?: boolean;
  /** Controls whether the relay subscription should ingest all non-ignored posts by default. If set true, and no "exclude"-type matchers are set on the subscription, then all included, non-ignored posts will be ingested. */
  match_by_default?: boolean;
  /** Never ingest sensitive posts via this subscription. */
  ignore_sensitive?: boolean;
  /** Never ingest posts with media attachments via this subscription. */
  ignore_media?: boolean;
  /** Never ingest non-self-replies (ie., comments) via this subscription. */
  ignore_replies?: boolean;
}

/**
 * @category Request params
 */
interface AdminRelayMatcherParams {
  /** The text to be matched. */
  keyword: string;
  /** Matcher should consider word boundaries. Defaults to false. */
  whole_word?: boolean;
  /** Matcher should cause matched posts to be excluded from relaying rather than included. Defaults to false. */
  exclude?: boolean;
}

/**
 * @category Request params
 */
interface AdminMediaCleanupParams {
  /**
   * Integer number of days, or duration string, of duration of remote media to keep.
   * If value is not specified, the value of media-remote-cache-days in the server config will be used.
   */
  remote_cache_days?: number | string;
}

/**
 * @category Request params
 */
interface AdminGetGroupsParams {}

/**
 * @category Request params
 */
interface AdminCreateInviteTokenParams {
  /** Integer. The maximum number of times the token can be used. */
  max_use?: number;
  /** String (ISO 8601 Datetime). The date when the token expires. */
  expires_at?: string;
}

/**
 * @category Request params
 */
interface AdminEmailInviteParams {
  /** String. The email address to send an invite to. */
  email: string;
  /** String. The display name of the invited user. */
  name?: string;
}

export type {
  AdminGetAccountsParams,
  AdminCreateAccountParams,
  AdminAccountAction,
  AdminAccountUpdateCredentialsParams,
  AdminPerformAccountActionParams,
  AdminGetDomainBlocksParams,
  AdminCreateDomainBlockParams,
  AdminUpdateDomainBlockParams,
  AdminGetReportsParams,
  AdminUpdateReportParams,
  AdminGetStatusesParams,
  AdminUpdateStatusParams,
  AdminGetCanonicalEmailBlocks,
  AdminDimensionKey,
  AdminGetDimensionsParams,
  AdminGetDomainAllowsParams,
  AdminGetEmailDomainBlocksParams,
  AdminGetIpBlocksParams,
  AdminCreateIpBlockParams,
  AdminUpdateIpBlockParams,
  AdminMeasureKey,
  AdminGetMeasuresParams,
  AdminGetAnnouncementsParams,
  AdminCreateAnnouncementParams,
  AdminUpdateAnnouncementParams,
  AdminCreateDomainParams,
  AdminGetModerationLogParams,
  AdminCreateRuleParams,
  AdminUpdateRuleParams,
  AdminGetCustomEmojisParams,
  AdminCreateCustomEmojiParams,
  AdminUpdateCustomEmojiParams,
  AdminDomainLimitMediaPolicy,
  AdminDomainLimitFollowsPolicy,
  AdminDomainLimitStatusesPolicy,
  AdminDomainLimitAccountsPolicy,
  AdminGetDomainLimitsParams,
  AdminCreateDomainLimitParams,
  AdminUpdateDomainLimitParams,
  AdminGetDomainPermissionDraftsParams,
  AdminCreateDomainPermissionDraftParams,
  AdminGetDomainPermissionExcludesParams,
  AdminCreateDomainPermissionExcludeParams,
  AdminGetDomainPermissionSubscriptionsParams,
  AdminCreateDomainPermissionSubscriptionParams,
  AdminUpdateDomainPermissionSubscriptionParams,
  AdminGetInstancesParams,
  AdminCreateHeaderFilterParams,
  AdminUpdateRelaySubscriptionParams,
  AdminRelayMatcherParams,
  AdminMediaCleanupParams,
  AdminGetGroupsParams,
  AdminCreateInviteTokenParams,
  AdminEmailInviteParams,
};
