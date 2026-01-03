import {
  type ParsedLocation,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Navigate,
  notFound,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import React, { useMemo } from 'react';
import * as v from 'valibot';

import { FE_SUBDIRECTORY, WITH_LANDING_PAGE } from 'pl-fe/build-config';
import Layout from 'pl-fe/components/ui/layout';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import AdminLayout from 'pl-fe/layouts/admin-layout';
import ChatsLayout from 'pl-fe/layouts/chats-layout';
import DefaultLayout from 'pl-fe/layouts/default-layout';
import EmptyLayout from 'pl-fe/layouts/empty-layout';
import EventLayout from 'pl-fe/layouts/event-layout';
import EventsLayout from 'pl-fe/layouts/events-layout';
import ExternalLoginLayout from 'pl-fe/layouts/external-login-layout';
import GroupLayout from 'pl-fe/layouts/group-layout';
import GroupsLayout from 'pl-fe/layouts/groups-layout';
import HomeLayout from 'pl-fe/layouts/home-layout';
import LandingLayout from 'pl-fe/layouts/landing-layout';
import ManageGroupsLayout from 'pl-fe/layouts/manage-groups-layout';
import ProfileLayout from 'pl-fe/layouts/profile-layout';
import RemoteInstanceLayout from 'pl-fe/layouts/remote-instance-layout';
import SearchLayout from 'pl-fe/layouts/search-layout';
import StatusLayout from 'pl-fe/layouts/status-layout';
import { instanceInitialState } from 'pl-fe/reducers/instance';
import { isStandalone } from 'pl-fe/utils/state';

import ChatPageMain from '../chats/components/chat-page/components/chat-page-main';
import ChatPageNew from '../chats/components/chat-page/components/chat-page-new';
import ChatPageSettings from '../chats/components/chat-page/components/chat-page-settings';
import ChatPageShoutbox from '../chats/components/chat-page/components/chat-page-shoutbox';

import ColumnLoading from './components/column-loading';
import {
  AboutPage,
  AccountGallery,
  AccountTimeline,
  AdminAccount,
  Aliases,
  Announcements,
  AuthTokenList,
  Backups,
  Blocks,
  BookmarkFolders,
  Bookmarks,
  BubbleTimeline,
  ChatIndex,
  Circle,
  Circles,
  CircleTimeline,
  CommunityTimeline,
  ComposeEvent,
  Conversations,
  CreateApp,
  CryptoDonate,
  Dashboard,
  DeleteAccount,
  Developers,
  Directory,
  DomainBlocks,
  Domains,
  DraftStatuses,
  Drive,
  EditEmail,
  EditFilter,
  EditGroup,
  EditPassword,
  EditProfile,
  EventDiscussion,
  EventInformation,
  Events,
  ExportData,
  ExternalLogin,
  FavouritedStatuses,
  FederationRestrictions,
  Filters,
  FollowedTags,
  Followers,
  Following,
  FollowRequests,
  GenericNotFound,
  GroupBlockedMembers,
  GroupGallery,
  GroupMembers,
  GroupMembershipRequests,
  GroupTimeline,
  Groups,
  HashtagTimeline,
  HomeTimeline,
  ImportData,
  IntentionalError,
  InteractionPolicies,
  InteractionRequests,
  LandingPage,
  LandingTimeline,
  LinkTimeline,
  Lists,
  ListTimeline,
  LoginPage,
  LogoutPage,
  ManageGroup,
  MfaForm,
  Migration,
  ModerationLog,
  Mutes,
  NewStatus,
  Notifications,
  OutgoingFollowRequests,
  PasswordReset,
  PinnedStatuses,
  PlFeConfig,
  PublicTimeline,
  Quotes,
  RegisterInvite,
  RegistrationPage,
  Relays,
  RemoteTimeline,
  Report,
  Rules,
  ScheduledStatuses,
  Search,
  ServerInfo,
  ServiceWorkerInfo,
  Settings,
  SettingsStore,
  Share,
  Status,
  TestTimeline,
  ThemeEditor,
  Privacy,
  UserIndex,
  WrenchedTimeline,
  EditEvent,
} from './util/async-components';

import type { Features } from 'pl-api';


interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasCrypto: boolean;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: React.lazy(() => import('pl-fe/features/ui')),
});

const requireAuth = ({ context: { isLoggedIn }, location }: { context: RouterContext; location: ParsedLocation }) => {
  localStorage.setItem('plfe:redirect_uri', location.href);
  if (!isLoggedIn) throw redirect({
    to: '/login',
  });
};

const requireAuthMiddleware = (next: (options: { context: RouterContext; location: ParsedLocation }) => void) =>
  (options: { context: RouterContext; location: ParsedLocation }) => {
    requireAuth(options);
    next?.(options);
  };

const layouts = {
  admin: createRoute({
    getParentRoute: () => rootRoute,
    id: 'admin-layout',
    component: AdminLayout,
  }),
  chats: createRoute({
    getParentRoute: () => rootRoute,
    id: 'chats-layout',
    component: ChatsLayout,
    beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
      if (!features.chats) throw notFound();
    }),
  }),
  default: createRoute({
    getParentRoute: () => rootRoute,
    id: 'default-layout',
    component: DefaultLayout,
  }),
  empty: createRoute({
    getParentRoute: () => rootRoute,
    id: 'empty-layout',
    component: EmptyLayout,
  }),
  event: createRoute({
    getParentRoute: () => rootRoute,
    path: '/@{$username}/events/$statusId',
    component: EventLayout,
  }),
  events: createRoute({
    getParentRoute: () => rootRoute,
    id: 'events-layout',
    component: EventsLayout,
  }),
  externalLogin: createRoute({
    getParentRoute: () => rootRoute,
    id: 'external-login-layout',
    component: ExternalLoginLayout,
  }),
  group: createRoute({
    getParentRoute: () => rootRoute,
    path: '/groups/$groupId',
    component: GroupLayout,
    beforeLoad: requireAuth,
  }),
  groups: createRoute({
    getParentRoute: () => rootRoute,
    id: 'groups-layout',
    component: GroupsLayout,
    beforeLoad: requireAuth,
  }),
  home: createRoute({
    getParentRoute: () => rootRoute,
    id: 'home-layout',
    component: HomeLayout,
  }),
  landing: createRoute({
    getParentRoute: () => rootRoute,
    id: 'landing-layout',
    component: LandingLayout,
  }),
  manageGroups: createRoute({
    getParentRoute: () => rootRoute,
    id: 'manage-groups-layout',
    component: ManageGroupsLayout,
    beforeLoad: requireAuth,
  }),
  profile: createRoute({
    getParentRoute: () => rootRoute,
    path: '/@{$username}',
    component: ProfileLayout,
  }),
  remoteInstance: createRoute({
    getParentRoute: () => rootRoute,
    path: '/timeline/$instance',
    component: RemoteInstanceLayout,
  }),
  search: createRoute({
    getParentRoute: () => rootRoute,
    id: 'search-layout',
    component: SearchLayout,
  }),
  status: createRoute({
    getParentRoute: () => rootRoute,
    id: 'status-layout',
    component: StatusLayout,
  }),
};

// Root routes
const HomeRoute = () => {
  const { redirectRootNoLogin } = usePlFeConfig();
  const standalone = useAppSelector(isStandalone);
  const { isLoggedIn } = useLoggedIn();

  if (!isLoggedIn && redirectRootNoLogin) return <Navigate to={redirectRootNoLogin} replace />;
  if (standalone && !isLoggedIn && !WITH_LANDING_PAGE) return <Navigate to='/login/external' replace />;

  if (isLoggedIn) return <HomeTimeline />;
  if (standalone && WITH_LANDING_PAGE) return <LandingPage />;
  return <LandingTimeline />;
};

export const homeRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/',
  component: HomeRoute,
});

// Auth routes
export const logoutRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/logout',
  component: LogoutPage,
});

export const loginRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/login',
  component: LoginPage,
});

export const loginAddRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/login/add',
  component: LoginPage,
});

export const loginExternalRoute = createRoute({
  getParentRoute: () => layouts.externalLogin,
  path: '/login/external',
  component: ExternalLogin,
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/reset-password',
  component: PasswordReset,
});

export const inviteRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/invite/$token',
  component: RegisterInvite,
});

export const signupRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/signup',
  component: RegistrationPage,
  beforeLoad: ({ context: { features, instance } }) => {
    if (!features.accountCreation || !instance.registrations.enabled) throw notFound();
  },
});

// Timeline routes
export const localTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/local',
  component: CommunityTimeline,
  beforeLoad: (options) => {
    const { context: { features, instance } } = options;
    if (instance.configuration.timelines_access.live_feeds.local !== 'public') {
      requireAuth(options);
    }
    if (!features.federating) throw notFound();
  },
});

export const federatedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/fediverse',
  component: PublicTimeline,
  beforeLoad: (options) => {
    const { context: { features, instance } } = options;
    if (instance.configuration.timelines_access.live_feeds.remote !== 'public') {
      requireAuth(options);
    }
    if (!features.federating) throw notFound();
  },
});

export const bubbleTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/bubble',
  component: BubbleTimeline,
  beforeLoad: (options) => {
    const { context: { features, instance } } = options;
    if (instance.configuration.timelines_access.live_feeds.bubble !== 'public') {
      requireAuth(options);
    }
    if (!features.bubbleTimeline) throw notFound();
  },
});

export const wrenchedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/wrenched',
  component: WrenchedTimeline,
  beforeLoad: (options) => {
    const { context: { features, instance } } = options;
    if (instance.configuration.timelines_access.live_feeds.wrenched !== 'public') {
      requireAuth(options);
    }
    if (!features.wrenchedTimeline) throw notFound();
  },
});

export const remoteTimelineRoute = createRoute({
  getParentRoute: () => layouts.remoteInstance,
  path: '/',
  component: RemoteTimeline,
  beforeLoad: (options) => {
    const { context: { features, instance } } = options;
    if (instance.configuration.timelines_access.live_feeds.remote !== 'public') {
      requireAuth(options);
    }
    if (!features.federating) throw notFound();
  },
});

// Conversations
export const conversationsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/conversations',
  component: Conversations,
  beforeLoad: (options) => {
    const { context: { features } } = options;
    requireAuth(options);
    if (!features.conversations) throw notFound();
  },
});

// Tags and links
export const hashtagTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/tags/$id',
  component: HashtagTimeline,
  beforeLoad: (options) => {
    const { context: { instance } } = options;
    if (instance.configuration.timelines_access.hashtag_feeds.local !== 'public') {
      requireAuth(options);
    }
  },
});

export const linkTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/links/$url',
  component: LinkTimeline,
});

// Lists and circles
export const listsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/lists',
  component: Lists,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.lists) throw notFound();
  }),
});

export const listTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/list/$listId',
  component: ListTimeline,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.lists) throw notFound();
  }),
});

export const circlesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles',
  component: Circles,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.circles) throw notFound();
  }),
});

export const circleTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles/$circleId',
  component: CircleTimeline,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.circles) throw notFound();
  }),
});

// Bookmarks
export const bookmarkFoldersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks',
  component: BookmarkFolders,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
    if (!features.bookmarkFolders) throw redirect({ to: '/bookmarks/$folderId', params: { folderId: 'all' } });
  }),
});

export const bookmarksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks/$folderId',
  component: Bookmarks,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
  }),
});

// Notifications
export const notificationsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/notifications',
  component: Notifications,
  beforeLoad: requireAuth,
});

// Search and directory
export const searchRoute = createRoute({
  getParentRoute: () => layouts.search,
  path: '/search',
  validateSearch: v.object({
    type: v.optional(v.picklist(['accounts', 'statuses', 'hashtags', 'links']), 'accounts'),
    q: v.optional(v.string()),
    accountId: v.optional(v.string()),
  }),
  component: Search,
});

export const directoryRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/directory',
  validateSearch: v.object({
    order: v.optional(v.picklist(['active', 'new']), 'active'),
    local: v.optional(v.boolean(), false),
  }),
  component: Directory,
  beforeLoad: ({ context: { features } }) => {
    if (!features.profileDirectory) throw notFound();
  },
});

// Events
export const eventsRoute = createRoute({
  getParentRoute: () => layouts.events,
  path: '/events',
  component: Events,
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

export const newEventRoute = createRoute({
  getParentRoute: () => layouts.events,
  path: '/events/new',
  component: ComposeEvent,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

// Chats
export const chatsRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats',
  component: ChatIndex,
});

export const chatsNewRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/new',
  component: ChatPageNew,
});

export const chatsSettingsRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/settings',
  component: ChatPageSettings,
});

export const shoutboxRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/shoutbox',
  component: ChatPageShoutbox,
});

export const chatRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/{-$chatId}',
  component: ChatPageMain,
});

// Follow requests and blocks
export const followRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/follow_requests',
  component: FollowRequests,
  beforeLoad: requireAuth,
});

export const outgoingFollowRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/outgoing_follow_requests',
  component: OutgoingFollowRequests,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.outgoingFollowRequests) throw notFound();
  }),
});

export const blocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/blocks',
  component: Blocks,
  beforeLoad: requireAuth,
});

export const domainBlocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/domain_blocks',
  component: DomainBlocks,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.federating) throw notFound();
  }),
});

export const mutesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/mutes',
  component: Mutes,
  beforeLoad: requireAuth,
});

// Filters
export const filtersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters',
  component: Filters,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  }),
});

export const editFilterRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters/$filterId',
  component: EditFilter,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  }),
});

// Followed tags
export const followedTagsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/followed_tags',
  component: FollowedTags,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.followedHashtagsList) throw notFound();
  }),
});

// Interaction requests
export const interactionRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/interaction_requests',
  component: InteractionRequests,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.interactionRequests) throw notFound();
  }),
});

// Profile routes
export const profileRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/',
  component: AccountTimeline,
  validateSearch: v.object({
    with_replies: v.optional(v.boolean()),
  }),
});

export const profileFollowersRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/followers',
  component: Followers,
});

export const profileFollowingRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/following',
  component: Following,
});

export const profileMediaRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/media',
  component: AccountGallery,
});

export const profileTaggedRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/tagged/$tag',
  component: AccountTimeline,
});

export const profileFavoritesRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/favorites',
  component: FavouritedStatuses,
});

export const profilePinsRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/pins',
  component: PinnedStatuses,
});

// Status routes
export const statusRoute = createRoute({
  getParentRoute: () => layouts.status,
  path: '/@{$username}/posts/$statusId',
  component: Status,
});

export const statusQuotesRoute = createRoute({
  getParentRoute: () => layouts.status,
  path: '/@{$username}/posts/$statusId/quotes',
  component: Quotes,
});

export const statusesIdRoute = createRoute({
  getParentRoute: () => layouts.status,
  path: '/statuses/$statusId',
  component: Status,
});

export const postsIdRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/posts/$statusId',
  component: Status,
});

export const noticeRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/notice/$statusId',
  component: Status,
});

export const notesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/notes/$statusId',
  component: Status,
});

// Event routes
export const eventInformationRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/',
  component: EventInformation,
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

export const eventEditRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/edit',
  component: EditEvent,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

export const eventDiscussionRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/discussion',
  component: EventDiscussion,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

// Groups routes
export const groupsRoute = createRoute({
  getParentRoute: () => layouts.groups,
  path: '/groups',
  component: Groups,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupTimelineRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/',
  component: GroupTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupMembersRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/members',
  component: GroupMembers,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupGalleryRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/media',
  component: GroupGallery,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const manageGroupRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage',
  component: ManageGroup,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const editGroupRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/edit',
  component: EditGroup,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupBlocksRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/blocks',
  component: GroupBlockedMembers,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupMembershipRequestsRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/requests',
  component: GroupMembershipRequests,
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

// Statuses
export const newStatusRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/statuses/new',
  component: NewStatus,
});

export const scheduledStatusesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/scheduled_statuses',
  component: ScheduledStatuses,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.scheduledStatuses) throw notFound();
  }),
});

export const draftStatusesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/draft_statuses',
  component: DraftStatuses,
  beforeLoad: requireAuth,
});

// Drive
export const driveRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/drive/{-$folderId}',
  component: Drive,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.drive) throw notFound();
  }),
});

// Circle
export const circleRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circle',
  component: Circle,
  beforeLoad: requireAuth,
});

// Settings routes
export const settingsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings',
  component: Settings,
  beforeLoad: requireAuth,
});

export const settingsProfileRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/profile',
  component: EditProfile,
  beforeLoad: requireAuth,
});

export const settingsExportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/export',
  component: ExportData,
  beforeLoad: requireAuth,
});

export const settingsImportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/import',
  component: ImportData,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.importBlocks && !features.importFollows && !features.importMutes) throw notFound();
  }),
});

export const settingsAliasesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/aliases',
  component: Aliases,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.manageAccountAliases) throw notFound();
  }),
});

export const settingsMigrationRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/migration',
  component: Migration,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.accountMoving) throw notFound();
  }),
});

export const settingsBackupsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/backups',
  component: Backups,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.accountBackups) throw notFound();
  }),
});

export const settingsEmailRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/email',
  component: EditEmail,
  beforeLoad: requireAuth,
});

export const settingsPasswordRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/password',
  component: EditPassword,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.changePassword) throw notFound();
  }),
});

export const settingsAccountRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/account',
  component: DeleteAccount,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.deleteAccount && !features.deleteAccountWithoutPassword) throw notFound();
  }),
});

export const settingsMfaRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/mfa',
  component: MfaForm,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.manageMfa) throw notFound();
  }),
});

export const settingsTokensRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/tokens',
  component: AuthTokenList,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.sessions) throw notFound();
  }),
});

export const settingsInteractionPoliciesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/interaction_policies',
  component: InteractionPolicies,
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.interactionRequests) throw notFound();
  }),
});

export const settingsPrivacyRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/privacy',
  component: Privacy,
  beforeLoad: requireAuth,
});

// PlFe config
export const plFeConfigRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/pl-fe/config',
  component: PlFeConfig,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

// Admin routes
export const adminDashboardRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin',
  component: Dashboard,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminAccountRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/accounts/$accountId',
  component: AdminAccount,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminApprovalRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/approval',
  component: Dashboard,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminReportsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/reports',
  component: Dashboard,
  validateSearch: v.object({
    resolved: v.optional(v.boolean(), false),
    account_id: v.optional(v.string()),
    target_account_id: v.optional(v.string()),
  }),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminReportRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/reports/$reportId',
  component: Report,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminLogRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/log',
  component: ModerationLog,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminUsersRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/users',
  component: UserIndex,
  validateSearch: v.object({
    q: v.optional(v.string()),
  }),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminThemeRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/theme',
  component: ThemeEditor,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminRelaysRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/relays',
  component: Relays,
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/announcements',
  component: Announcements,
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.announcements) throw notFound();
  }),
});

export const adminDomainsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/domains',
  component: Domains,
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.domains) throw notFound();
  }),
});

export const adminRulesRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/rules',
  component: Rules,
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.adminRules) throw notFound();
  }),
});

// Info and other routes
export const serverInfoRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/info',
  component: ServerInfo,
});

export const aboutRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/about/{-$slug}',
  component: AboutPage,
});

export const shareRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/share',
  component: Share,
  validateSearch: v.object({
    title: v.optional(v.string(), ''),
    text: v.optional(v.string(), ''),
    url: v.optional(v.string(), ''),
  }),
  beforeLoad: requireAuth,
});

// Developers routes
export const developersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers',
  component: Developers,
  beforeLoad: requireAuth,
});

export const developersAppsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/apps/create',
  component: CreateApp,
  beforeLoad: requireAuth,
});

export const developersSettingsStoreRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/settings_store',
  component: SettingsStore,
  beforeLoad: requireAuth,
});

export const developersTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/timeline',
  component: TestTimeline,
  beforeLoad: requireAuth,
});

export const developersSwRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/sw',
  component: ServiceWorkerInfo,
  beforeLoad: requireAuth,
});

export const errorRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/error',
  component: IntentionalError,
});

export const networkErrorRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/error/network',
  component: React.lazy(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: TEST'))),
});

// Crypto donate
export const cryptoDonateRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/donate/crypto',
  component: CryptoDonate,
  beforeLoad: ({ context: { hasCrypto } }) => {
    if (!hasCrypto) throw notFound();
  },
});

// Federation restrictions
export const federationRestrictionsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/federation_restrictions',
  component: FederationRestrictions,
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

const routeTree = rootRoute.addChildren([
  layouts.admin.addChildren([
    adminDashboardRoute,
    adminAccountRoute,
    adminApprovalRoute,
    adminReportsRoute,
    adminReportRoute,
    adminLogRoute,
    adminUsersRoute,
    adminThemeRoute,
    adminRelaysRoute,
    adminAnnouncementsRoute,
    adminDomainsRoute,
    adminRulesRoute,
  ]),
  layouts.chats.addChildren([
    chatsNewRoute,
    chatsSettingsRoute,
    shoutboxRoute,
    chatRoute,
  ]),
  layouts.default.addChildren([
    conversationsRoute,
    hashtagTimelineRoute,
    linkTimelineRoute,
    listsRoute,
    listTimelineRoute,
    circlesRoute,
    circleTimelineRoute,
    bookmarkFoldersRoute,
    bookmarksRoute,
    notificationsRoute,
    directoryRoute,
    followRequestsRoute,
    outgoingFollowRequestsRoute,
    blocksRoute,
    domainBlocksRoute,
    mutesRoute,
    filtersRoute,
    editFilterRoute,
    followedTagsRoute,
    interactionRequestsRoute,
    newStatusRoute,
    scheduledStatusesRoute,
    draftStatusesRoute,
    driveRoute,
    circleRoute,
    settingsRoute,
    settingsProfileRoute,
    settingsExportRoute,
    settingsImportRoute,
    settingsAliasesRoute,
    settingsMigrationRoute,
    settingsBackupsRoute,
    settingsEmailRoute,
    settingsPasswordRoute,
    settingsAccountRoute,
    settingsMfaRoute,
    settingsTokensRoute,
    settingsInteractionPoliciesRoute,
    settingsPrivacyRoute,
    plFeConfigRoute,
    aboutRoute,
    shareRoute,
    developersRoute,
    developersAppsRoute,
    developersSettingsStoreRoute,
    developersTimelineRoute,
    developersSwRoute,
    cryptoDonateRoute,
    federationRestrictionsRoute,
    postsIdRoute,
    noticeRoute,
    notesRoute,
    loginRoute,
    loginAddRoute,
    resetPasswordRoute,
    inviteRoute,
  ]),
  layouts.empty.addChildren([
    logoutRoute,
    signupRoute,
    serverInfoRoute,
    errorRoute,
    networkErrorRoute,
  ]),
  layouts.event.addChildren([
    eventInformationRoute,
    eventDiscussionRoute,
  ]),
  layouts.events.addChildren([
    eventsRoute,
    newEventRoute,
    eventEditRoute,
  ]),
  layouts.externalLogin.addChildren([loginExternalRoute]),
  layouts.group.addChildren([
    groupTimelineRoute,
    groupMembersRoute,
    groupGalleryRoute,
  ]),
  layouts.groups.addChildren([groupsRoute]),
  layouts.home.addChildren([
    homeRoute,
    localTimelineRoute,
    federatedTimelineRoute,
    bubbleTimelineRoute,
    wrenchedTimelineRoute,
  ]),
  layouts.landing.addChildren([/*landingTimelineRoute*/]),
  layouts.manageGroups.addChildren([
    manageGroupRoute,
    editGroupRoute,
    groupBlocksRoute,
    groupMembershipRequestsRoute,
  ]),
  layouts.profile.addChildren([
    profileRoute,
    profileFollowersRoute,
    profileFollowingRoute,
    profileMediaRoute,
    profileTaggedRoute,
    profileFavoritesRoute,
    profilePinsRoute,
  ]),
  layouts.remoteInstance.addChildren([remoteTimelineRoute]),
  layouts.search.addChildren([searchRoute]),
  layouts.status.addChildren([
    statusRoute,
    statusQuotesRoute,
    statusesIdRoute,
  ]),
]);

const FallbackLayout: React.FC<{ children: JSX.Element }> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside />
  </>
);

const PendingComponent: React.FC = () => (
  <FallbackLayout>
    <ColumnLoading />
  </FallbackLayout>
);

const router = createRouter({
  routeTree,
  basepath: FE_SUBDIRECTORY,
  context: {
    instance: instanceInitialState,
    features: {} as Features,
    isLoggedIn: false,
    isAdmin: false,
    hasCrypto: false,
  },
  defaultNotFoundComponent: GenericNotFound,
  defaultPendingComponent: PendingComponent,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface HistoryState {
    modalIndex?: number;
  }
}

const RouterWithContext = () => {
  const instance = useInstance();
  const features = useFeatures();
  const { cryptoAddresses } = usePlFeConfig();
  const hasCrypto = cryptoAddresses.length > 0;
  const { account } = useOwnAccount();

  const context: RouterContext = useMemo(() => ({
    instance,
    features,
    isLoggedIn: !!account,
    isAdmin: !!(account?.is_admin || account?.is_moderator),
    hasCrypto,
  }), [features.version, hasCrypto, !!account, account?.is_admin, account?.is_moderator]);

  return (
    <RouterProvider router={router} context={context} />
  );
};

export { layouts, rootRoute, router, RouterWithContext };
