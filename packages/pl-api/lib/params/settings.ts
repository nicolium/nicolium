// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Features } from '../features';

/**
 * @category Request params
 */
type CreateAccountParams = {
  /** String. The desired username for the account */
  username: string;
  /** String. The email address to be used for login */
  email: string;
  /** String. The password to be used for login */
  password: string;
  /** Whether the user agrees to the local rules, terms, and policies. These should be presented to the user in order to allow them to consent before setting this parameter to TRUE. */
  agreement: boolean;
  /** String. The language of the confirmation email that will be sent. */
  locale: string;
  /** String. If registrations require manual approval, this text will be reviewed by moderators. */
  reason?: string;
  /** String ([Date](https://docs.joinmastodon.org/api/datetime-format/#date)), required if the server has a minimum age requirement */
  date_of_birth?: string;

  fullname?: string;
  bio?: string;
  /** optional, contains provider-specific captcha solution */
  captcha_solution?: string;
  /** optional, contains provider-specific captcha token */
  captcha_token?: string;
  /** optional, contains provider-specific captcha data */
  captcha_answer_data?: string;
  /** invite token required when the registrations aren't public. */
  token?: string;

  /** optional, domain id, if multitenancy is enabled. */
  domain?: string;

  accepts_email_list?: boolean;

  /** Invite code */
  invite_code?: string;
} & (
  | {
      /** EIP-4361 message */
      message: string;
      /** EIP-4361 signature (required if message is present) */
      signature: string;
    }
  | Record<string, never>
);

/**
 * @category Request params
 */
interface UpdateCredentialsParams {
  /** String. The display name to use for the profile. */
  display_name?: string;
  /** String. The account bio. */
  note?: string;
  /** Avatar image encoded using `multipart/form-data` */
  avatar?: File | '';
  /** Header image encoded using `multipart/form-data` */
  header?: File | '';
  /** Boolean. Whether manual approval of follow requests is required. */
  locked?: boolean;
  /** Boolean. Whether the account has a bot flag. */
  bot?: boolean;
  /**
   * Boolean. Whether the account should be shown in the profile directory.
   * Requires features{@link Features.accountDiscoverability}
   */
  discoverable?: boolean;
  /** Boolean. Whether to hide followers and followed accounts. */
  hide_collections?: boolean;
  /** Boolean. Whether public posts should be searchable to anyone. */
  indexable?: boolean;
  /** Hash. The profile fields to be set. Inside this hash, the key is an integer cast to a string (although the exact integer does not matter), and the value is another hash including name and value. By default, max 4 fields. */
  fields_attributes?: Record<
    string,
    {
      /** String. The name of the profile field. By default, max 255 characters. */
      name: string;
      /** String. The value of the profile field. By default, max 255 characters. */
      value: string;
    }
  >;
  source?: {
    /** String. Default post privacy for authored statuses. Can be `public`, `unlisted`, or `private`. */
    privacy?: string;
    /** Boolean. Whether to mark authored statuses as sensitive by default. */
    sensitive?: boolean;
    /** String. Default language to use for authored statuses (ISO 6391) */
    language?: string;
    /** String (Enumerable, oneOf `public` `followers` `nobody`). Default quote policy for new posts. */
    quote_policy?: 'public' | 'followers' | 'nobody';
  };

  /** if true, html tags are stripped from all statuses requested from the API */
  no_rich_text?: boolean;
  /** if true, user's followers will be hidden*/
  hide_followers?: boolean;
  /** if true, user's follows will be hidden */
  hide_follows?: boolean;
  /** if true, user's follower count will be hidden */
  hide_followers_count?: boolean;
  /** if true, user's follow count will be hidden */
  hide_follows_count?: boolean;
  /** if true, user's favorites timeline will be hidden */
  hide_favorites?: boolean;
  /** if true, user's role (e.g admin, moderator) will be exposed to anyone in the API */
  show_role?: boolean;
  /** the scope returned under privacy key in Source subentity */
  default_scope?: string;
  /** Opaque user settings to be saved on the backend. */
  settings_store?: Record<string, any>;
  /** if true, skip filtering out broken threads */
  skip_thread_containment?: boolean;
  /** if true, allows automatically follow moved following accounts */
  allow_following_move?: boolean;
  /** array of ActivityPub IDs, needed for following move */
  also_known_as?: string[];
  /** sets the background image of the user. Can be set to "" (an empty string) to reset. */
  background_image?: string;
  /** the type of this account. */
  actor_type?: string;
  /** if false, this account will reject all chat messages. */
  accepts_chat_messages?: boolean;
  /** user's preferred language for receiving emails (digest, confirmation, etc.) */
  language?: string;

  /**
   * Description of avatar image, for alt-text.
   *
   * Requires features{@link Features.accountAvatarDescription}.
   */
  avatar_description?: string;
  /**
   * Description of header image, for alt-text.
   * Requires features{@link Features.accountAvatarDescription}.
   */
  header_description?: string;
  /**
   * Custom CSS to use when rendering this account's profile or statuses. String must be no more than 5,000 characters (~5kb).
   * Requires `instance.configuration.accounts.allow_custom_css`.
   */
  custom_css?: string;
  /**
   * Enable RSS feed for this account's Public posts at `/[username]/feed.rss`
   * Requires features{@link Features.accountEnableRss}.
   */
  enable_rss?: boolean;
  /**
   * Include boosts created by the account on the web view of the account.
   * Requires features{@link Features.accountWebIncludeBoosts}.
   */
  web_include_boosts?: boolean;
  /**
   * Layout to use for the web view of the account.
   * - `microblog`: default, classic microblog layout.
   * - `gallery`: gallery layout with media only.
   * Requires features{@link Features.accountWebLayout}.
   */
  web_layout?: 'microblog' | 'gallery';
  /**
   * Posts to show on the web view of the account.
   * - `public`: default, show only Public visibility posts on the web.
   * - `unlisted`: show Public and Unlisted visibility posts on the web.
   * - `none`: show no posts on the web, not even Public ones.
   * Requires features{@link Features.accountWebVisibility}.
   */
  web_visibility?: 'public' | 'unlisted' | 'none';

  /** Whether the user is a cat */
  is_cat?: boolean;
  /** Whether the user speaks as a cat */
  speak_as_cat?: boolean;

  /**
   * Mention policy
   * Required features{@link Features.accountMentionPolicy}.
   */
  mention_policy?: 'none' | 'only_known' | 'only_contacts';
}

/**
 * @category Request params
 */
interface UpdateNotificationSettingsParams {
  /**
   * blocks notifications from accounts you do not follow
   */
  block_from_strangers?: boolean;

  /**
   * When set to true, it removes the contents of a message from the push notification.
   */
  hide_notification_contents?: boolean;
}

/**
 * @category Request params
 */
type UpdateInteractionPoliciesParams = Record<
  'public' | 'unlisted' | 'private' | 'direct',
  Record<
    'can_favourite' | 'can_reblog' | 'can_reply',
    Record<
      'always' | 'with_approval',
      Array<
        'public' | 'followers' | 'following' | 'mutuals' | 'mentioned' | 'author' | 'me' | string
      >
    >
  >
>;

export type {
  CreateAccountParams,
  UpdateCredentialsParams,
  UpdateNotificationSettingsParams,
  UpdateInteractionPoliciesParams,
};
