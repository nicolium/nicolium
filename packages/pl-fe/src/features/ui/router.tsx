import {
  type ParsedLocation,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  notFound,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import React, { useMemo } from 'react';
import * as v from 'valibot';

import { FE_SUBDIRECTORY, WITH_LANDING_PAGE } from 'pl-fe/build-config';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
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
  isStandalone: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasCrypto: boolean;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: React.lazy(() => import('pl-fe/features/ui')),
});

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
  }),
  groups: createRoute({
    getParentRoute: () => rootRoute,
    id: 'groups-layout',
    component: GroupsLayout,
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

const requireAuth = ({ context: { isLoggedIn }, location }: { context: RouterContext; location: ParsedLocation }) => {
  localStorage.setItem('plfe:redirect_uri', location.href);
  if (!isLoggedIn) throw redirect({
    to: '/login',
  });
};

// Root routes
export const homeTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/',
  component: HomeTimeline,
  beforeLoad: ({ context: { isLoggedIn } }) => {
    if (!isLoggedIn) throw notFound();
  },
});

export const landingTimelineRoute = createRoute({
  getParentRoute: () => layouts.landing,
  path: '/',
  component: LandingTimeline,
  beforeLoad: ({ context: { isLoggedIn } }) => {
    if (isLoggedIn) throw notFound();
  },
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
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

export const federatedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/fediverse',
  component: PublicTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

export const bubbleTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/bubble',
  component: BubbleTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.bubbleTimeline) throw notFound();
  },
});

export const wrenchedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/wrenched',
  component: WrenchedTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.wrenchedTimeline) throw notFound();
  },
});

export const remoteTimelineRoute = createRoute({
  getParentRoute: () => layouts.remoteInstance,
  path: '/',
  component: RemoteTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

// Conversations
export const conversationsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/conversations',
  component: Conversations,
  beforeLoad: ({ context: { features } }) => {
    if (!features.conversations) throw notFound();
  },
});

// Tags and links
export const hashtagTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/tags/$id',
  component: HashtagTimeline,
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
  beforeLoad: ({ context: { features } }) => {
    if (!features.lists) throw notFound();
  },
});

export const listTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/list/$id',
  component: ListTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.lists) throw notFound();
  },
});

export const circlesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles',
  component: Circles,
  beforeLoad: ({ context: { features } }) => {
    if (!features.circles) throw notFound();
  },
});

export const circleTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles/$id',
  component: CircleTimeline,
  beforeLoad: ({ context: { features } }) => {
    if (!features.circles) throw notFound();
  },
});

// Bookmarks
export const bookmarkFoldersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks',
  component: BookmarkFolders,
  beforeLoad: ({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
    if (!features.bookmarkFolders) throw redirect({ to: '/bookmarks/$folderId', params: { folderId: 'all' } });
  },
});

export const bookmarksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks/$folderId',
  component: Bookmarks,
  beforeLoad: ({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
  },
});

// Notifications
export const notificationsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/notifications',
  component: Notifications,
});

// Search and directory
export const searchRoute = createRoute({
  getParentRoute: () => layouts.search,
  path: '/search',
  component: Search,
});

export const directoryRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/directory',
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
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

// Chats
export const chatsIndexRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats',
  component: ChatIndex,
  beforeLoad: ({ context: { features } }) => {
    if (!features.chats) throw notFound();
  },
});

export const chatsNewRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats/new',
  component: ChatIndex,
  beforeLoad: ({ context: { features } }) => {
    if (!features.chats) throw notFound();
  },
});

export const chatsSettingsRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats/settings',
  component: ChatIndex,
  beforeLoad: ({ context: { features } }) => {
    if (!features.chats) throw notFound();
  },
});

export const shoutboxRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats/shoutbox',
  component: ChatIndex,
  beforeLoad: ({ context: { features } }) => {
    if (!features.shoutbox) throw notFound();
  },
});

export const chatIdRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats/$chatId',
  component: ChatIndex,
  beforeLoad: ({ context: { features } }) => {
    if (!features.chats) throw notFound();
  },
});

// Follow requests and blocks
export const followRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/follow_requests',
  component: FollowRequests,
});

export const outgoingFollowRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/outgoing_follow_requests',
  component: OutgoingFollowRequests,
  beforeLoad: ({ context: { features } }) => {
    if (!features.outgoingFollowRequests) throw notFound();
  },
});

export const blocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/blocks',
  component: Blocks,
});

export const domainBlocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/domain_blocks',
  component: DomainBlocks,
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

export const mutesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/mutes',
  component: Mutes,
});

// Filters
export const filtersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters',
  component: Filters,
  beforeLoad: ({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  },
});

export const editFilterRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters/$filterId',
  component: EditFilter,
  beforeLoad: ({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  },
});

// Followed tags
export const followedTagsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/followed_tags',
  component: FollowedTags,
  beforeLoad: ({ context: { features } }) => {
    if (!features.followedHashtagsList) throw notFound();
  },
});

// Interaction requests
export const interactionRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/interaction_requests',
  component: InteractionRequests,
  beforeLoad: ({ context: { features } }) => {
    if (!features.interactionRequests) throw notFound();
  },
});

// Profile routes
export const profileRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/',
  component: AccountTimeline,
  validateSearch: v.object({
    with_replies: v.optional(v.boolean(), false),
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
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

export const eventDiscussionRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/discussion',
  component: EventDiscussion,
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
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
  beforeLoad: ({ context: { features } }) => {
    if (!features.scheduledStatuses) throw notFound();
  },
});

export const draftStatusesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/draft_statuses',
  component: DraftStatuses,
});

// Drive
export const driveRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/drive/{-$folderId}',
  component: Drive,
  beforeLoad: ({ context: { features } }) => {
    if (!features.drive) throw notFound();
  },
});

// Circle
export const circleRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circle',
  component: Circle,
});

// Settings routes
export const settingsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings',
  component: Settings,
});

export const settingsProfileRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/profile',
  component: EditProfile,
});

export const settingsExportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/export',
  component: ExportData,
});

export const settingsImportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/import',
  component: ImportData,
  beforeLoad: ({ context: { features } }) => {
    if (!features.importBlocks && !features.importFollows && !features.importMutes) throw notFound();
  },
});

export const settingsAliasesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/aliases',
  component: Aliases,
  beforeLoad: ({ context: { features } }) => {
    if (!features.manageAccountAliases) throw notFound();
  },
});

export const settingsMigrationRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/migration',
  component: Migration,
  beforeLoad: ({ context: { features } }) => {
    if (!features.accountMoving) throw notFound();
  },
});

export const settingsBackupsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/backups',
  component: Backups,
  beforeLoad: ({ context: { features } }) => {
    if (!features.accountBackups) throw notFound();
  },
});

export const settingsEmailRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/email',
  component: EditEmail,
});

export const settingsPasswordRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/password',
  component: EditPassword,
});

export const settingsAccountRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/account',
  component: DeleteAccount,
});

export const settingsMfaRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/mfa',
  component: MfaForm,
});

export const settingsTokensRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/tokens',
  component: AuthTokenList,
});

export const settingsInteractionPoliciesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/interaction_policies',
  component: InteractionPolicies,
  beforeLoad: ({ context: { features } }) => {
    if (!features.interactionRequests) throw notFound();
  },
});

export const settingsPrivacyRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/privacy',
  component: Privacy,
});

// PlFe config
export const plFeConfigRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/pl-fe/config',
  component: PlFeConfig,
});

// Admin routes
export const adminDashboardRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin',
  component: Dashboard,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminAccountRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/accounts/$accountId',
  component: AdminAccount,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminApprovalRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/approval',
  component: Dashboard,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminReportsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/reports',
  component: Dashboard,
  beforeLoad: (options) => {
    requireAuth(options);
    if (!options.context.isAdmin) throw notFound();
  },
});

export const adminReportRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/reports/$reportId',
  component: Report,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminLogRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/log',
  component: ModerationLog,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminUsersRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/users',
  component: UserIndex,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminThemeRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/theme',
  component: ThemeEditor,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminRelaysRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/relays',
  component: Relays,
  beforeLoad: ({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  },
});

export const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/announcements',
  component: Announcements,
  beforeLoad: ({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.announcements) throw notFound();
  },
});

export const adminDomainsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/domains',
  component: Domains,
  beforeLoad: ({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.domains) throw notFound();
  },
});

export const adminRulesRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/pl-fe/admin/rules',
  component: Rules,
  beforeLoad: ({ context: { features, isAdmin } }) => {
    if (!isAdmin || features.adminRules) throw notFound();
  },
});

// Info and other routes
export const serverInfoRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/info',
  component: ServerInfo,
});

export const aboutRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/about/$slug',
  component: AboutPage,
});

export const aboutIndexRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/about',
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
});

// Developers routes
export const developersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers',
  component: Developers,
});

export const developersAppsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/apps/create',
  component: CreateApp,
});

export const developersSettingsStoreRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/settings_store',
  component: SettingsStore,
});

export const developersTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/timeline',
  component: TestTimeline,
});

export const developersSwRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/sw',
  component: ServiceWorkerInfo,
});

export const errorRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/error',
  component: IntentionalError,
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
    chatsIndexRoute,
    chatsNewRoute,
    chatsSettingsRoute,
    shoutboxRoute,
    chatIdRoute,
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
    aboutIndexRoute,
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
    homeTimelineRoute,
    localTimelineRoute,
    federatedTimelineRoute,
    bubbleTimelineRoute,
    wrenchedTimelineRoute,
  ]),
  layouts.landing.addChildren([landingTimelineRoute]),
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

const router = createRouter({
  routeTree,
  basepath: FE_SUBDIRECTORY,
  context: {
    instance: instanceInitialState,
    features: {} as Features,
    isLoggedIn: false,
    isStandalone: false,
    isAdmin: false,
    hasCrypto: false,
    // instance,
    // features,
    // isStandalone: standalone,
    // isLoggedIn,
    // isAdmin: true,
    // hasCrypto,
  },
  defaultNotFoundComponent: GenericNotFound,
  defaultPendingComponent: ColumnLoading,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const RouterWithContext = () => {
  const instance = useInstance();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const standalone = useAppSelector(isStandalone);
  const { cryptoAddresses } = usePlFeConfig();
  const hasCrypto = cryptoAddresses.length > 0;

  const context = useMemo(() => ({
    instance,
    features,
    isLoggedIn,
    isStandalone: standalone,
    hasCrypto,
  }), [features.version, isLoggedIn, standalone, hasCrypto]);

  return (
    <RouterProvider router={router} context={context} />
  );
};

export { layouts, rootRoute, router, RouterWithContext };
