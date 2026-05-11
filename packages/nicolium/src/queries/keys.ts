import type { MinifiedScrobble } from './accounts/account-scrobble';
import type { ChatMessage } from './chats';
import type { MinifiedGroupMember } from './groups/use-group-members';
import type { FilterType } from './notifications/use-notifications';
import type { DraftStatus } from './statuses/use-draft-statuses';
import type { MinifiedInteractionRequest } from './statuses/use-interaction-requests';
import type { MinifiedContext } from './statuses/use-status';
import type { MinifiedStatusEdit } from './statuses/use-status-history';
import type { MinifiedEmojiReaction } from './statuses/use-status-interactions';
import type { MinifiedSuggestion } from './trends/use-suggested-accounts';
import type {
  MinifiedAdminAccount,
  MinifiedAdminReport,
  MinifiedConversation,
} from './utils/minify-list';
import type { NormalizedStatus } from '@/queries/statuses/normalize';
import type { DataTag, InfiniteData } from '@tanstack/react-query';
import type {
  Account,
  AdminAnnouncement,
  AdminCohort,
  AdminDimension,
  AdminDimensionKey,
  AdminDomain,
  AdminDomainAllow,
  AdminDomainBlock,
  AdminGetAccountsParams,
  AdminGetDimensionsParams,
  AdminGetMeasuresParams,
  AdminGetReportsParams,
  AdminGetStatusesParams,
  AdminMeasure,
  AdminMeasureKey,
  AdminModerationLogEntry,
  AdminRelay,
  AdminRule,
  Announcement,
  Antenna,
  Backup,
  BookmarkFolder,
  Chat,
  Circle,
  CredentialAccount,
  CustomEmoji,
  DriveFile,
  DriveFolder,
  Filter,
  Group,
  GroupRelationship,
  GroupRole,
  InteractionPolicies,
  List,
  Location,
  Marker,
  NotificationGroup,
  OauthToken,
  PaginatedResponse,
  PlApiClient,
  PleromaConfig,
  PleromaConfigDescription,
  Poll,
  Relationship,
  RssFeed,
  ScheduledStatus,
  Tag,
  Translation,
  TrendsLink,
} from 'pl-api';

type TaggedKey<TKey extends readonly unknown[], TData> = DataTag<TKey, TData>;

const accounts = {
  root: ['accounts'] as const,
  show: (accountId: string) => {
    const key = ['accounts', accountId] as const;
    return key as TaggedKey<typeof key, Account>;
  },
  lookup: (acct: string) => {
    const key = ['accounts', 'lookup', acct] as const;
    return key as TaggedKey<typeof key, string>;
  },
};

const accountCredentials = {
  root: ['credentialAccount'] as const,
  show: (currentAccountUrl: string) => {
    const key = [currentAccountUrl, 'credentialAccount'] as const;
    return key as TaggedKey<typeof key, CredentialAccount>;
  },
};

const accountRelationships = {
  root: ['accountRelationships'] as const,
  show: (accountId: string) => {
    const key = ['accountRelationships', accountId] as const;
    return key as TaggedKey<typeof key, Relationship>;
  },
};

const accountsLists = {
  root: ['accountsLists'] as const,
  followers: (accountId: string) => {
    const key = ['accountsLists', 'followers', accountId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  following: (accountId: string) => {
    const key = ['accountsLists', 'following', accountId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  subscribers: (accountId: string, includeExpired?: boolean) => {
    const key = ['accountsLists', 'subscribers', accountId, includeExpired] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  blocked: ['accountsLists', 'blocked'] as TaggedKey<
    ['accountsLists', 'blocked'],
    InfiniteData<PaginatedResponse<[string, string | null]>>
  >,
  muted: ['accountsLists', 'muted'] as TaggedKey<
    ['accountsLists', 'muted'],
    InfiniteData<PaginatedResponse<[string, string | null]>>
  >,
  endorsedAccounts: (accountId: string) => {
    const key = ['accountsLists', 'endorsedAccounts', accountId] as const;
    return key as TaggedKey<typeof key, Array<string>>;
  },
  familiarFollowers: (accountId: string) => {
    const key = ['accountsLists', 'familiarFollowers', accountId] as const;
    return key as TaggedKey<typeof key, Array<string>>;
  },
  birthdayReminders: (month: number, day: number) => {
    const key = ['accountsLists', 'birthdayReminders', month, day] as const;
    return key as TaggedKey<typeof key, Array<string>>;
  },
  directory: (order: string, local: boolean) => {
    const key = ['accountsLists', 'directory', order, local] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  followRequests: ['accountsLists', 'followRequests'] as TaggedKey<
    ['accountsLists', 'followRequests'],
    InfiniteData<PaginatedResponse<string>>
  >,
  outgoingFollowRequests: ['accountsLists', 'outgoingFollowRequests'] as TaggedKey<
    ['accountsLists', 'outgoingFollowRequests'],
    InfiniteData<PaginatedResponse<string>>
  >,
  listMembers: (listId: string) => {
    const key = ['accountsLists', 'lists', listId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  circleMembers: (circleId: string) => {
    const key = ['accountsLists', 'circles', circleId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  antennaMembers: (antennaId: string) => {
    const key = ['accountsLists', 'antennas', antennaId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  antennaExcludedAccounts: (antennaId: string) => {
    const key = ['accountsLists', 'antennas', antennaId, 'excluded'] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  groupMembers: {
    root: (groupId: string) => {
      const key = ['accountsLists', 'groupMembers', groupId] as const;
      return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<MinifiedGroupMember>>>;
    },
    byRole: (groupId: string, role?: GroupRole) => {
      const key = ['accountsLists', 'groupMembers', groupId, role] as const;
      return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<MinifiedGroupMember>>>;
    },
  },
  groupMembershipRequests: (groupId: string) => {
    const key = ['accountsLists', 'groupMembershipRequests', groupId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  groupBlocks: (groupId: string) => {
    const key = ['accountsLists', 'groupBlocks', groupId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  eventParticipations: (statusId: string) => {
    const key = ['accountsLists', 'eventParticipations', statusId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  eventParticipationRequests: (statusId: string) => {
    const key = ['accountsLists', 'eventParticipationRequests', statusId] as const;
    return key as TaggedKey<
      typeof key,
      InfiniteData<PaginatedResponse<{ account_id: string; participation_message: string }>>
    >;
  },
  statusFavourites: (statusId: string) => {
    const key = ['accountsLists', 'statusFavourites', statusId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  statusDislikes: (statusId: string) => {
    const key = ['accountsLists', 'statusDislikes', statusId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  statusReblogs: (statusId: string) => {
    const key = ['accountsLists', 'statusReblogs', statusId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  statusReactions: (statusId: string, emoji?: string) => {
    const key = ['accountsLists', 'statusReactions', statusId, emoji] as const;
    return key as TaggedKey<typeof key, Array<MinifiedEmojiReaction>>;
  },
  joinedEvents: ['accountsLists', 'joinedEvents'] as TaggedKey<
    ['accountsLists', 'joinedEvents'],
    InfiniteData<PaginatedResponse<string>>
  >,
};

const statusLists = {
  root: ['statusLists'] as const,
  pins: (accountId: string) => {
    const key = ['statusLists', 'pins', accountId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  favourites: (accountId: string) => {
    const key = ['statusLists', 'favourites', accountId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  bookmarks: (folderId?: string | null) => {
    const key = ['statusLists', 'bookmarks', folderId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  bookmarksRoot: ['statusLists', 'bookmarks'] as const,
  quotes: (statusId: string) => {
    const key = ['statusLists', 'quotes', statusId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  recentEvents: ['statusLists', 'recentEvents'] as TaggedKey<
    ['statusLists', 'recentEvents'],
    InfiniteData<PaginatedResponse<string>>
  >,
  joinedEvents: ['statusLists', 'joinedEvents'] as TaggedKey<
    ['statusLists', 'joinedEvents'],
    InfiniteData<PaginatedResponse<string>>
  >,
  mutedThreads: ['statusLists', 'mutedThreads'] as TaggedKey<
    ['statusLists', 'mutedThreads'],
    InfiniteData<PaginatedResponse<string>>
  >,
};

const statuses = {
  root: ['statuses'] as const,
  show: (statusId: string) => {
    const key = ['statuses', statusId] as const;
    return key as TaggedKey<typeof key, NormalizedStatus>;
  },
  contexts: (statusId: string) => {
    const key = ['statuses', 'contexts', statusId] as const;
    return key as TaggedKey<typeof key, MinifiedContext>;
  },
  polls: {
    root: ['statuses', 'polls'] as const,
    show: (pollId: string) => {
      const key = ['statuses', 'polls', pollId] as const;
      return key as TaggedKey<typeof key, Poll>;
    },
  },
  translations: (statusId: string, targetLanguage: string) => {
    const key = ['statuses', 'translations', statusId, targetLanguage] as const;
    return key as TaggedKey<typeof key, Translation>;
  },
  localTranslations: (statusId: string, targetLanguage: string) => {
    const key = ['statuses', 'localTranslations', statusId, targetLanguage] as const;
    return key as TaggedKey<typeof key, Translation>;
  },
  history: (statusId: string) => {
    const key = ['statuses', 'history', statusId] as const;
    return key as TaggedKey<typeof key, Array<MinifiedStatusEdit>>;
  },
};

const chats = {
  root: ['chats'] as const,
  chat: (chatId?: string) => {
    const key = ['chats', 'chat', chatId] as const;
    return key as TaggedKey<typeof key, Chat>;
  },
  chatMessages: (chatId: string) => {
    const key = ['chats', 'messages', chatId] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<ChatMessage>>>;
  },
  search: ['chats', 'search'] as TaggedKey<
    ['chats', 'search'],
    InfiniteData<PaginatedResponse<Chat>>
  >,
};

const groups = {
  root: ['groups'] as const,
  show: (groupId: string) => {
    const key = ['groups', groupId] as const;
    return key as TaggedKey<typeof key, Group>;
  },
};

const groupLists = {
  root: ['groupLists'] as const,
  myGroups: ['groupLists', 'myGroups'] as TaggedKey<['groupLists', 'myGroups'], Array<string>>,
};

const groupRelationships = {
  root: ['groupRelationships'] as const,
  show: (groupId: string) => {
    const key = ['groupRelationships', groupId] as const;
    return key as TaggedKey<typeof key, GroupRelationship>;
  },
};

const admin = {
  root: ['admin'] as const,
  config: ['admin', 'config'] as TaggedKey<['admin', 'config'], PleromaConfig>,
  configDescriptions: ['admin', 'configDescriptions'] as TaggedKey<
    ['admin', 'configDescriptions'],
    Array<PleromaConfigDescription>
  >,
  accounts: {
    root: ['admin', 'accounts'] as const,
    show: (accountId: string) => {
      const key = ['admin', 'accounts', accountId] as const;
      return key as TaggedKey<typeof key, MinifiedAdminAccount>;
    },
    statuses: (accountId: string, params?: AdminGetStatusesParams) => {
      const key = ['admin', 'accounts', 'statuses', accountId, params] as const;
      return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
    },
  },
  accountLists: {
    root: ['admin', 'accountLists'] as const,
    show: (params?: AdminGetAccountsParams) => {
      const key = ['admin', 'accountLists', params] as const;
      return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
    },
  },
  reports: {
    root: ['admin', 'reports'] as const,
    show: (reportId: string) => {
      const key = ['admin', 'reports', reportId] as const;
      return key as TaggedKey<typeof key, MinifiedAdminReport>;
    },
  },
  reportLists: {
    root: ['admin', 'reportLists'] as const,
    show: (params?: AdminGetReportsParams) => {
      const key = ['admin', 'reportLists', params] as const;
      return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
    },
  },
  rules: ['admin', 'rules'] as TaggedKey<['admin', 'rules'], Array<AdminRule>>,
  relays: ['admin', 'relays'] as TaggedKey<['admin', 'relays'], Array<AdminRelay>>,
  domains: ['admin', 'domains'] as TaggedKey<['admin', 'domains'], Array<AdminDomain>>,
  announcements: ['admin', 'announcements'] as TaggedKey<
    ['admin', 'announcements'],
    InfiniteData<PaginatedResponse<AdminAnnouncement>>
  >,
  moderationLog: ['admin', 'moderation_log'] as TaggedKey<
    ['admin', 'moderation_log'],
    InfiniteData<PaginatedResponse<AdminModerationLogEntry>>
  >,
  dimensions: (keys: Array<AdminDimensionKey>, params?: AdminGetDimensionsParams) => {
    const key = ['admin', 'dimensions', keys, params] as const;
    return key as TaggedKey<typeof key, Array<AdminDimension>>;
  },
  measures: (
    keys: Array<AdminMeasureKey>,
    startAt: string,
    endAt: string,
    params?: AdminGetMeasuresParams,
  ) => {
    const key = ['admin', 'measures', keys, startAt, endAt, params] as const;
    return key as TaggedKey<typeof key, Array<AdminMeasure>>;
  },
  retention: (startAt: string, endAt: string, frequency: 'day' | 'month') => {
    const key = ['admin', 'retention', startAt, endAt, frequency] as const;
    return key as TaggedKey<typeof key, Array<AdminCohort>>;
  },
  domainBlocks: ['admin', 'domainBlocks'] as TaggedKey<
    ['admin', 'domainBlocks'],
    InfiniteData<PaginatedResponse<AdminDomainBlock>>
  >,
  domainAllows: ['admin', 'domainAllows'] as TaggedKey<
    ['admin', 'domainAllows'],
    InfiniteData<PaginatedResponse<AdminDomainAllow>>
  >,
};

const notifications = {
  root: ['notifications'] as const,
  list: (activeFilter?: FilterType) => {
    const key = ['notifications', activeFilter] as const;
    return key as TaggedKey<
      typeof key,
      InfiniteData<PaginatedResponse<Array<NotificationGroup>, false>>
    >;
  },
};

const markers = {
  root: ['markers'] as const,
  timeline: (timeline: 'home' | 'notifications') => {
    const key = ['markers', timeline] as const;
    return key as TaggedKey<typeof key, Marker>;
  },
};

const search = {
  root: ['search'] as const,
  accounts: (query: string, params?: Record<string, unknown>) => {
    const key = ['search', 'accounts', query, params] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  statuses: (query: string, params?: Record<string, unknown>) => {
    const key = ['search', 'statuses', query, params] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  hashtags: (query: string, params?: Record<string, unknown>) => {
    const key = ['search', 'hashtags', query, params] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<Tag>>>;
  },
  groups: (query: string, params?: Record<string, unknown>) => {
    const key = ['search', 'groups', query, params] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  accountSearch: (query: string, params?: Record<string, unknown>) => {
    const key = ['search', 'accountSearch', query, params] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  location: (query: string) => {
    const key = ['search', 'location', query] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<Location>>>;
  },
};

const trends = {
  root: ['trends'] as const,
  tags: ['trends', 'tags'] as TaggedKey<['trends', 'tags'], Array<Tag>>,
  statuses: ['trends', 'statuses'] as TaggedKey<['trends', 'statuses'], Array<string>>,
  links: ['trends', 'links'] as TaggedKey<['trends', 'links'], Array<TrendsLink>>,
};

const suggestions = {
  root: ['suggestions'] as const,
  all: ['suggestions'] as TaggedKey<['suggestions'], Array<MinifiedSuggestion>>,
};

const timelineIds = {
  root: ['timelineIds'] as const,
  accountMedia: (accountId: string) => {
    const key = ['timelineIds', `account:${accountId}:with_replies:media`] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
  groupMedia: (groupId: string) => {
    const key = ['timelineIds', `group:${groupId}:media`] as const;
    return key as TaggedKey<typeof key, InfiniteData<PaginatedResponse<string>>>;
  },
};

const settings = {
  root: ['settings'] as const,
  mfa: ['settings', 'mfa'] as TaggedKey<
    ['settings', 'mfa'],
    Awaited<ReturnType<InstanceType<typeof PlApiClient>['settings']['mfa']['getMfaSettings']>>
  >,
  backups: ['settings', 'backups'] as TaggedKey<['settings', 'backups'], Array<Backup>>,
  accountAliases: ['settings', 'accountAliases'] as TaggedKey<
    ['settings', 'accountAliases'],
    Array<string>
  >,
  domainBlocks: ['settings', 'domainBlocks'] as TaggedKey<
    ['settings', 'domainBlocks'],
    InfiniteData<PaginatedResponse<string>>
  >,
};

const interactionPolicies = {
  root: ['interactionPolicies'] as const,
  all: ['interactionPolicies'] as TaggedKey<['interactionPolicies'], InteractionPolicies>,
};

const filters = {
  root: ['filters'] as const,
  all: ['filters'] as TaggedKey<['filters'], Array<Filter>>,
  show: (filterId: string) => {
    const key = ['filters', filterId] as const;
    return key as TaggedKey<typeof key, Filter>;
  },
};

const security = {
  root: ['security'] as const,
  oauthTokens: ['security', 'oauthTokens'] as TaggedKey<
    ['security', 'oauthTokens'],
    InfiniteData<PaginatedResponse<OauthToken>>
  >,
};

const drive = {
  root: ['drive'] as const,
  files: {
    root: ['drive', 'files'] as const,
    show: (fileId: string) => {
      const key = ['drive', 'files', fileId] as const;
      return key as TaggedKey<typeof key, DriveFile>;
    },
  },
  folders: {
    root: ['drive', 'folders'] as const,
    show: (folderId?: string) => {
      const key = ['drive', 'folders', folderId] as const;
      return key as TaggedKey<typeof key, DriveFolder>;
    },
  },
};

const hashtags = {
  root: ['hashtags'] as const,
  show: (tag: string) => {
    const key = ['hashtags', tag] as const;
    return key as TaggedKey<typeof key, Tag>;
  },
};

const followedTags = {
  root: ['followedTags'] as const,
  all: ['followedTags'] as TaggedKey<['followedTags'], InfiniteData<PaginatedResponse<Tag>>>,
};

const conversations = {
  root: ['conversations'] as const,
  all: ['conversations'] as TaggedKey<
    ['conversations'],
    InfiniteData<PaginatedResponse<MinifiedConversation>>
  >,
};

const announcements = {
  root: ['announcements'] as const,
  all: ['announcements'] as TaggedKey<['announcements'], Array<Announcement>>,
};

const scrobbles = {
  root: ['scrobbles'] as const,
  show: (accountId: string) => {
    const key = ['scrobbles', accountId] as const;
    return key as TaggedKey<typeof key, MinifiedScrobble | null>;
  },
};

const lists = {
  root: ['lists'] as const,
  all: ['lists'] as TaggedKey<['lists'], Array<List>>,
  forAccount: (accountId: string) => {
    const key = ['lists', 'forAccount', accountId] as const;
    return key as TaggedKey<typeof key, Array<string>>;
  },
};

const circles = {
  root: ['circles'] as const,
  all: ['circles'] as TaggedKey<['circles'], Array<Circle>>,
};

const antennas = {
  root: ['antennas'] as const,
  all: ['antennas'] as TaggedKey<['antennas'], Array<Antenna>>,
  domains: (antennaId: string) => {
    const key = ['antennas', antennaId, 'domains'] as const;
    return key as TaggedKey<typeof key, { domains: Array<string>; exclude_domains: Array<string> }>;
  },
  keywords: (antennaId: string) => {
    const key = ['antennas', antennaId, 'keywords'] as const;
    return key as TaggedKey<
      typeof key,
      { keywords: Array<string>; exclude_keywords: Array<string> }
    >;
  },
  tags: (antennaId: string) => {
    const key = ['antennas', antennaId, 'tags'] as const;
    return key as TaggedKey<typeof key, { tags: Array<string>; exclude_tags: Array<string> }>;
  },
};

const bookmarkFolders = {
  root: ['bookmarkFolders'] as const,
  all: ['bookmarkFolders'] as TaggedKey<['bookmarkFolders'], Array<BookmarkFolder>>,
  forStatus: (statusId: string) => {
    const key = ['bookmarkFolders', 'status', statusId] as const;
    return key as TaggedKey<typeof key, Array<BookmarkFolder>>;
  },
};

const draftStatuses = {
  root: ['draftStatuses'] as const,
  all: ['draftStatuses'] as TaggedKey<['draftStatuses'], Record<string, DraftStatus>>,
};

const scheduledStatuses = {
  root: ['scheduledStatuses'] as const,
  all: ['scheduledStatuses'] as TaggedKey<
    ['scheduledStatuses'],
    InfiniteData<PaginatedResponse<ScheduledStatus>>
  >,
};

const interactionRequests = {
  root: ['interactionRequests'] as const,
  all: ['interactionRequests'] as TaggedKey<
    ['interactionRequests'],
    InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>
  >,
};

const embed = {
  root: ['embed'] as const,
  show: (url: string) =>
    ['embed', url] as TaggedKey<
      ['embed', string],
      Awaited<ReturnType<PlApiClient['oembed']['getOembed']>>
    >,
};

const rssFeedSubscriptions = {
  root: ['rssFeedSubscriptions'] as const,
  all: ['rssFeedSubscriptions'] as TaggedKey<['rssFeedSubscriptions'], Array<RssFeed>>,
};

const translationLanguages = {
  root: ['translationLanguages'] as const,
  all: ['translationLanguages'] as TaggedKey<
    ['translationLanguages'],
    Record<string, Array<string>>
  >,
};

const instance = {
  root: ['instance'] as const,
  customEmojis: ['instance', 'customEmojis'] as TaggedKey<
    ['instance', 'customEmojis'],
    Array<CustomEmoji>
  >,
};

const frontend = {
  root: ['frontend'] as const,
  aboutPages: (slug: string, locale?: string) => {
    const key = ['frontend', 'aboutPages', slug, locale] as const;
    return key as TaggedKey<typeof key, string>;
  },
};

const queryKeys = {
  accounts,
  accountCredentials,
  accountRelationships,
  accountsLists,
  statusLists,
  statuses,
  chats,
  groups,
  groupLists,
  groupRelationships,
  admin,
  notifications,
  markers,
  search,
  trends,
  suggestions,
  timelineIds,
  settings,
  interactionPolicies,
  filters,
  security,
  drive,
  hashtags,
  followedTags,
  conversations,
  announcements,
  scrobbles,
  lists,
  circles,
  antennas,
  bookmarkFolders,
  draftStatuses,
  scheduledStatuses,
  interactionRequests,
  embed,
  rssFeedSubscriptions,
  translationLanguages,
  instance,
  frontend,
} as const;

export { queryKeys };
