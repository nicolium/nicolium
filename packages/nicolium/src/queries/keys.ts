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
import type { InfiniteData } from '@tanstack/react-query';
import type {
  Account,
  AdminAnnouncement,
  AdminCanonicalEmailBlock,
  AdminCohort,
  AdminDimension,
  AdminDimensionKey,
  AdminDomain,
  AdminDomainAllow,
  AdminDomainBlock,
  AdminEmailDomainBlock,
  AdminGetAccountsParams,
  AdminGetDimensionsParams,
  AdminGetMeasuresParams,
  AdminGetReportsParams,
  AdminGetStatusesParams,
  AdminInvite,
  AdminIpBlock,
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
  Collection,
  CredentialAccount,
  CustomEmoji,
  DriveFile,
  DriveFolder,
  Filter,
  GifResults,
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

type TaggedKey<TKey extends readonly unknown[], TData> = TKey & {
  readonly ['~scopedData']?: TData;
};

type DataOf<TKey> = TKey extends { readonly ['~scopedData']?: infer TData } ? TData : unknown;

const key =
  <TData>() =>
  <const TKey extends readonly unknown[]>(...parts: TKey): TaggedKey<TKey, TData> =>
    parts as TaggedKey<TKey, TData>;

const accounts = {
  root: ['accounts'] as const,
  show: (accountId: string) => key<Account>()('accounts', accountId),
  latestStatus: (accountId: string) => key<string | null>()('accounts', accountId, 'latestStatus'),
  lookup: (acct: string) => key<string>()('accounts', 'lookup', acct),
};

const accountCredentials = {
  root: ['credentialAccount'] as const,
  show: (currentAccountUrl: string) =>
    key<CredentialAccount>()(currentAccountUrl, 'credentialAccount'),
};

const accountRelationships = {
  root: ['accountRelationships'] as const,
  show: (accountId: string) => key<Relationship>()('accountRelationships', accountId),
};

const accountsLists = {
  root: ['accountsLists'] as const,
  followers: (accountId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'followers', accountId),
  following: (accountId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'following', accountId),
  subscribers: (accountId: string, includeExpired?: boolean) =>
    key<InfiniteData<PaginatedResponse<string>>>()(
      'accountsLists',
      'subscribers',
      accountId,
      includeExpired,
    ),
  blocked: key<InfiniteData<PaginatedResponse<[string, string | null]>>>()(
    'accountsLists',
    'blocked',
  ),
  muted: key<InfiniteData<PaginatedResponse<[string, string | null]>>>()('accountsLists', 'muted'),
  endorsedAccounts: (accountId: string) =>
    key<Array<string>>()('accountsLists', 'endorsedAccounts', accountId),
  familiarFollowers: (accountId: string) =>
    key<Array<string>>()('accountsLists', 'familiarFollowers', accountId),
  birthdayReminders: (month: number, day: number) =>
    key<Array<string>>()('accountsLists', 'birthdayReminders', month, day),
  directory: (order: string, local: boolean) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'directory', order, local),
  followRequests: key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'followRequests'),
  outgoingFollowRequests: key<InfiniteData<PaginatedResponse<string>>>()(
    'accountsLists',
    'outgoingFollowRequests',
  ),
  listMembers: (listId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'lists', listId),
  circleMembers: (circleId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'circles', circleId),
  antennaMembers: (antennaId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'antennas', antennaId),
  antennaExcludedAccounts: (antennaId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()(
      'accountsLists',
      'antennas',
      antennaId,
      'excluded',
    ),
  groupMembers: {
    root: (groupId: string) =>
      key<InfiniteData<PaginatedResponse<MinifiedGroupMember>>>()(
        'accountsLists',
        'groupMembers',
        groupId,
      ),
    byRole: (groupId: string, role?: GroupRole) =>
      key<InfiniteData<PaginatedResponse<MinifiedGroupMember>>>()(
        'accountsLists',
        'groupMembers',
        groupId,
        role,
      ),
  },
  groupMembershipRequests: (groupId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()(
      'accountsLists',
      'groupMembershipRequests',
      groupId,
    ),
  groupBlocks: (groupId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'groupBlocks', groupId),
  eventParticipations: (statusId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()(
      'accountsLists',
      'eventParticipations',
      statusId,
    ),
  eventParticipationRequests: (statusId: string) => {
    const key = ['accountsLists', 'eventParticipationRequests', statusId] as const;
    return key as TaggedKey<
      typeof key,
      InfiniteData<PaginatedResponse<{ account_id: string; participation_message: string }>>
    >;
  },
  statusFavourites: (statusId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'statusFavourites', statusId),
  statusDislikes: (statusId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'statusDislikes', statusId),
  statusReblogs: (statusId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'statusReblogs', statusId),
  statusReactions: (statusId: string, emoji?: string) =>
    key<Array<MinifiedEmojiReaction>>()('accountsLists', 'statusReactions', statusId, emoji),
  joinedEvents: key<InfiniteData<PaginatedResponse<string>>>()('accountsLists', 'joinedEvents'),
};

const statusLists = {
  root: ['statusLists'] as const,
  pins: (accountId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'pins', accountId),
  favourites: (accountId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'favourites', accountId),
  bookmarks: (folderId?: string | null) =>
    key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'bookmarks', folderId),
  bookmarksRoot: ['statusLists', 'bookmarks'] as const,
  quotes: (statusId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'quotes', statusId),
  recentEvents: key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'recentEvents'),
  joinedEvents: key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'joinedEvents'),
  mutedThreads: key<InfiniteData<PaginatedResponse<string>>>()('statusLists', 'mutedThreads'),
};

const statuses = {
  root: ['statuses'] as const,
  show: (statusId: string) => key<NormalizedStatus>()('statuses', statusId),
  contexts: (statusId: string) => key<MinifiedContext>()('statuses', 'contexts', statusId),
  polls: {
    root: ['statuses', 'polls'] as const,
    show: (pollId: string) => key<Poll>()('statuses', 'polls', pollId),
  },
  translations: (statusId: string, targetLanguage: string) =>
    key<Translation>()('statuses', 'translations', statusId, targetLanguage),
  localTranslations: (statusId: string, targetLanguage: string) =>
    key<Translation>()('statuses', 'localTranslations', statusId, targetLanguage),
  history: (statusId: string) => key<Array<MinifiedStatusEdit>>()('statuses', 'history', statusId),
};

const chats = {
  root: ['chats'] as const,
  chat: (chatId?: string) => key<Chat>()('chats', 'chat', chatId),
  chatMessages: (chatId: string) =>
    key<InfiniteData<PaginatedResponse<ChatMessage>>>()('chats', 'messages', chatId),
  search: key<InfiniteData<PaginatedResponse<Chat>>>()('chats', 'search'),
};

const groups = {
  root: ['groups'] as const,
  show: (groupId: string) => key<Group>()('groups', groupId),
};

const groupLists = {
  root: ['groupLists'] as const,
  myGroups: key<Array<string>>()('groupLists', 'myGroups'),
};

const groupRelationships = {
  root: ['groupRelationships'] as const,
  show: (groupId: string) => key<GroupRelationship>()('groupRelationships', groupId),
};

const admin = {
  root: ['admin'] as const,
  config: key<PleromaConfig>()('admin', 'config'),
  configDescriptions: key<Array<PleromaConfigDescription>>()('admin', 'configDescriptions'),
  accounts: {
    root: ['admin', 'accounts'] as const,
    show: (accountId: string) => key<MinifiedAdminAccount>()('admin', 'accounts', accountId),
    statuses: (accountId: string, params?: AdminGetStatusesParams) =>
      key<InfiniteData<PaginatedResponse<string>>>()(
        'admin',
        'accounts',
        'statuses',
        accountId,
        params,
      ),
  },
  accountLists: {
    root: ['admin', 'accountLists'] as const,
    show: (params?: AdminGetAccountsParams) =>
      key<InfiniteData<PaginatedResponse<string>>>()('admin', 'accountLists', params),
  },
  reports: {
    root: ['admin', 'reports'] as const,
    show: (reportId: string) => key<MinifiedAdminReport>()('admin', 'reports', reportId),
  },
  reportLists: {
    root: ['admin', 'reportLists'] as const,
    show: (params?: AdminGetReportsParams) =>
      key<InfiniteData<PaginatedResponse<string>>>()('admin', 'reportLists', params),
  },
  rules: key<Array<AdminRule>>()('admin', 'rules'),
  relays: key<Array<AdminRelay>>()('admin', 'relays'),
  domains: key<Array<AdminDomain>>()('admin', 'domains'),
  announcements: key<InfiniteData<PaginatedResponse<AdminAnnouncement>>>()(
    'admin',
    'announcements',
  ),
  moderationLog: key<InfiniteData<PaginatedResponse<AdminModerationLogEntry>>>()(
    'admin',
    'moderation_log',
  ),
  dimensions: (keys: Array<AdminDimensionKey>, params?: AdminGetDimensionsParams) =>
    key<Array<AdminDimension>>()('admin', 'dimensions', keys, params),
  measures: (
    keys: Array<AdminMeasureKey>,
    startAt: string,
    endAt: string,
    params?: AdminGetMeasuresParams,
  ) => key<Array<AdminMeasure>>()('admin', 'measures', keys, startAt, endAt, params),
  retention: (startAt: string, endAt: string, frequency: 'day' | 'month') =>
    key<Array<AdminCohort>>()('admin', 'retention', startAt, endAt, frequency),
  domainBlocks: key<InfiniteData<PaginatedResponse<AdminDomainBlock>>>()('admin', 'domainBlocks'),
  domainAllows: key<InfiniteData<PaginatedResponse<AdminDomainAllow>>>()('admin', 'domainAllows'),
  emailDomainBlocks: key<InfiniteData<PaginatedResponse<AdminEmailDomainBlock>>>()(
    'admin',
    'emailDomainBlocks',
  ),
  ipBlocks: key<InfiniteData<PaginatedResponse<AdminIpBlock>>>()('admin', 'ipBlocks'),
  canonicalEmailBlocks: key<InfiniteData<PaginatedResponse<AdminCanonicalEmailBlock>>>()(
    'admin',
    'canonicalEmailBlocks',
  ),
  invites: key<Array<AdminInvite>>()('admin', 'invites'),
  policies: {
    root: ['admin', 'policies'] as const,
    one: (policyName: string) => key<Record<string, unknown>>()('admin', 'policies', policyName),
  },
};

const notifications = {
  root: ['notifications'] as const,
  list: (activeFilter?: FilterType, hideBots?: boolean) => {
    const key = ['notifications', activeFilter, hideBots] as const;
    return key as TaggedKey<
      typeof key,
      InfiniteData<PaginatedResponse<Array<NotificationGroup>, false>>
    >;
  },
};

const markers = {
  root: ['markers'] as const,
  timeline: (timeline: 'home' | 'notifications') => key<Marker>()('markers', timeline),
};

const search = {
  root: ['search'] as const,
  accounts: (query: string, params?: Record<string, unknown>) =>
    key<InfiniteData<PaginatedResponse<string>>>()('search', 'accounts', query, params),
  statuses: (query: string, params?: Record<string, unknown>) =>
    key<InfiniteData<PaginatedResponse<string>>>()('search', 'statuses', query, params),
  hashtags: (query: string, params?: Record<string, unknown>) =>
    key<InfiniteData<PaginatedResponse<Tag>>>()('search', 'hashtags', query, params),
  groups: (query: string, params?: Record<string, unknown>) =>
    key<InfiniteData<PaginatedResponse<string>>>()('search', 'groups', query, params),
  accountSearch: (query: string, params?: Record<string, unknown>) =>
    key<InfiniteData<PaginatedResponse<string>>>()('search', 'accountSearch', query, params),
  location: (query: string) =>
    key<InfiniteData<PaginatedResponse<Location>>>()('search', 'location', query),
  gifs: (query: string) => key<GifResults>()('search', 'gifs', query),
};

const trends = {
  root: ['trends'] as const,
  tags: key<Array<Tag>>()('trends', 'tags'),
  statuses: key<Array<string>>()('trends', 'statuses'),
  links: key<Array<TrendsLink>>()('trends', 'links'),
};

const suggestions = {
  root: ['suggestions'] as const,
  all: key<Array<MinifiedSuggestion>>()('suggestions'),
};

const timelineIds = {
  root: ['timelineIds'] as const,
  accountMedia: (accountId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()(
      'timelineIds',
      `account:${accountId}:with_replies:media`,
    ),
  groupMedia: (groupId: string) =>
    key<InfiniteData<PaginatedResponse<string>>>()('timelineIds', `group:${groupId}:media`),
};

const settings = {
  root: ['settings'] as const,
  mfa: key<
    Awaited<ReturnType<InstanceType<typeof PlApiClient>['settings']['mfa']['getMfaSettings']>>
  >()('settings', 'mfa'),
  backups: key<Array<Backup>>()('settings', 'backups'),
  accountAliases: key<Array<string>>()('settings', 'accountAliases'),
  domainBlocks: key<InfiniteData<PaginatedResponse<string>>>()('settings', 'domainBlocks'),
};

const interactionPolicies = {
  root: ['interactionPolicies'] as const,
  all: key<InteractionPolicies>()('interactionPolicies'),
};

const filters = {
  root: ['filters'] as const,
  all: key<Array<Filter>>()('filters'),
  show: (filterId: string) => key<Filter>()('filters', filterId),
};

const security = {
  root: ['security'] as const,
  oauthTokens: key<InfiniteData<PaginatedResponse<OauthToken>>>()('security', 'oauthTokens'),
};

const drive = {
  root: ['drive'] as const,
  files: {
    root: ['drive', 'files'] as const,
    show: (fileId: string) => key<DriveFile>()('drive', 'files', fileId),
  },
  folders: {
    root: ['drive', 'folders'] as const,
    show: (folderId?: string) => key<DriveFolder>()('drive', 'folders', folderId),
  },
};

const hashtags = {
  root: ['hashtags'] as const,
  show: (tag: string) => key<Tag>()('hashtags', tag),
};

const followedTags = {
  root: ['followedTags'] as const,
  all: key<InfiniteData<PaginatedResponse<Tag>>>()('followedTags'),
};

const conversations = {
  root: ['conversations'] as const,
  all: key<InfiniteData<PaginatedResponse<MinifiedConversation>>>()('conversations'),
};

const announcements = {
  root: ['announcements'] as const,
  all: key<Array<Announcement>>()('announcements'),
};

const scrobbles = {
  root: ['scrobbles'] as const,
  show: (accountId: string) => key<MinifiedScrobble | null>()('scrobbles', accountId),
};

const lists = {
  root: ['lists'] as const,
  all: key<Array<List>>()('lists'),
  forAccount: (accountId: string) => key<Array<string>>()('lists', 'forAccount', accountId),
};

const circles = {
  root: ['circles'] as const,
  all: key<Array<Circle>>()('circles'),
};

const antennas = {
  root: ['antennas'] as const,
  all: key<Array<Antenna>>()('antennas'),
  domains: (antennaId: string) =>
    key<{ domains: Array<string>; exclude_domains: Array<string> }>()(
      'antennas',
      antennaId,
      'domains',
    ),
  keywords: (antennaId: string) => {
    const key = ['antennas', antennaId, 'keywords'] as const;
    return key as TaggedKey<
      typeof key,
      { keywords: Array<string>; exclude_keywords: Array<string> }
    >;
  },
  tags: (antennaId: string) =>
    key<{ tags: Array<string>; exclude_tags: Array<string> }>()('antennas', antennaId, 'tags'),
};

const collections = {
  root: ['collections'] as const,
  show: (collectionId: string) => key<Collection>()('collections', collectionId),
  byAccount: (accountId: string) => key<Array<Collection>>()('collections', 'byAccount', accountId),
  featuringAccount: (accountId: string) =>
    key<Array<Collection>>()('collections', 'featuringAccount', accountId),
};

const bookmarkFolders = {
  root: ['bookmarkFolders'] as const,
  all: key<Array<BookmarkFolder>>()('bookmarkFolders'),
  forStatus: (statusId: string) =>
    key<Array<BookmarkFolder>>()('bookmarkFolders', 'status', statusId),
};

const draftStatuses = {
  root: ['draftStatuses'] as const,
  all: key<Record<string, DraftStatus>>()('draftStatuses'),
};

const scheduledStatuses = {
  root: ['scheduledStatuses'] as const,
  all: key<InfiniteData<PaginatedResponse<ScheduledStatus>>>()('scheduledStatuses'),
};

const interactionRequests = {
  root: ['interactionRequests'] as const,
  all: key<InfiniteData<PaginatedResponse<MinifiedInteractionRequest>>>()('interactionRequests'),
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
  all: key<Array<RssFeed>>()('rssFeedSubscriptions'),
};

const translationLanguages = {
  root: ['translationLanguages'] as const,
  all: key<Record<string, Array<string>>>()('translationLanguages'),
};

const instance = {
  root: ['instance'] as const,
  customEmojis: key<Array<CustomEmoji>>()('instance', 'customEmojis'),
  bubbleDomains: key<Array<string>>()('instance', 'bubbleDomains'),
};

const frontend = {
  root: ['frontend'] as const,
  aboutPages: (slug: string, locale?: string) =>
    key<string>()('frontend', 'aboutPages', slug, locale),
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
  collections,
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
export type { DataOf, TaggedKey };
