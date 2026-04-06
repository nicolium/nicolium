import {
  type ParsedLocation,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent as lazy,
  Navigate,
  notFound,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import { instanceSchema } from 'pl-api';
import React, { useMemo } from 'react';
import * as v from 'valibot';
import * as val from 'valibot';

import { FE_SUBDIRECTORY } from '@/build-config';
import SiteError from '@/components/site-error';
import Layout from '@/components/ui/layout';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useOwnAccount } from '@/hooks/use-own-account';
import AdminLayout from '@/layouts/admin-layout';
import ChatsLayout from '@/layouts/chats-layout';
import DefaultLayout from '@/layouts/default-layout';
import EmptyLayout from '@/layouts/empty-layout';
import EventLayout from '@/layouts/event-layout';
import EventsLayout from '@/layouts/events-layout';
import ExternalLoginLayout from '@/layouts/external-login-layout';
import GroupLayout from '@/layouts/group-layout';
import GroupsLayout from '@/layouts/groups-layout';
import HomeLayout from '@/layouts/home-layout';
import ManageGroupsLayout from '@/layouts/manage-groups-layout';
import ProfileLayout from '@/layouts/profile-layout';
import RemoteInstanceLayout from '@/layouts/remote-instance-layout';
import SearchLayout from '@/layouts/search-layout';
import StatusLayout from '@/layouts/status-layout';
import { useInstance } from '@/stores/instance';
import { LOCAL_STORAGE_REDIRECT_KEY } from '@/utils/redirect';

import ChatsPageChat from '../features/chats/components/chats-page/components/chats-page-chat';
import ChatsPageEmpty from '../features/chats/components/chats-page/components/chats-page-empty';
import ChatsPageNew from '../features/chats/components/chats-page/components/chats-page-new';
import ChatsPageSettings from '../features/chats/components/chats-page/components/chats-page-settings';
import ChatsPageShoutbox from '../features/chats/components/chats-page/components/chats-page-shoutbox';
import ColumnLoading from '../features/ui/components/column-loading';

import type { Features } from 'pl-api';

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasCrypto: boolean;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: lazy(() => import('@/features/ui')),
});

const requireAuth = ({
  context: { isLoggedIn },
  location,
}: {
  context: RouterContext;
  location: ParsedLocation;
}) => {
  localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, location.href);
  if (!isLoggedIn)
    throw redirect({
      to: '/login',
    });
};

const requireAuthMiddleware =
  (next: (options: { context: RouterContext; location: ParsedLocation }) => void) =>
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
    validateSearch: v.object({
      with_replies: v.optional(v.boolean()),
    }),
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
export const homeRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/',
  component: lazy(() => import('./util')),
});

// Auth routes
export const logoutRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/logout',
  component: lazy(() => import('@/pages/auth/logout')),
});

export const loginRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/login',
  component: lazy(() => import('@/pages/auth/login')),
});

export const loginAddRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/login/add',
  component: lazy(() => import('@/pages/auth/login')),
});

export const loginExternalRoute = createRoute({
  getParentRoute: () => layouts.externalLogin,
  path: '/login/external',
  component: lazy(() => import('@/pages/auth/external-login')),
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/reset-password',
  component: lazy(() => import('@/pages/auth/password-reset')),
});

export const inviteRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/invite/$token',
  component: lazy(() => import('@/pages/auth/register-with-invite')),
});

export const signupRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/signup',
  component: lazy(() => import('@/pages/auth/registration')),
  beforeLoad: ({ context: { features, instance } }) => {
    if (!features.accountCreation || !instance.registrations.enabled) throw notFound();
  },
});

// Timeline routes
export const localTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/local',
  component: lazy(() => import('@/pages/timelines/community-timeline')),
  beforeLoad: (options) => {
    const {
      context: { features, instance },
    } = options;
    if (instance.configuration.timelines_access.live_feeds.local !== 'public') {
      requireAuth(options);
    }
    if (!features.federating) throw notFound();
  },
});

export const federatedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/fediverse',
  component: lazy(() => import('@/pages/timelines/public-timeline')),
  beforeLoad: (options) => {
    const {
      context: { features, instance },
    } = options;
    if (instance.configuration.timelines_access.live_feeds.remote !== 'public') {
      requireAuth(options);
    }
    if (!features.federating) throw notFound();
  },
});

export const bubbleTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/bubble',
  component: lazy(() => import('@/pages/timelines/bubble-timeline')),
  beforeLoad: (options) => {
    const {
      context: { features, instance },
    } = options;
    if (instance.configuration.timelines_access.live_feeds.bubble !== 'public') {
      requireAuth(options);
    }
    if (!features.bubbleTimeline) throw notFound();
  },
});

export const wrenchedTimelineRoute = createRoute({
  getParentRoute: () => layouts.home,
  path: '/timeline/wrenched',
  component: lazy(() => import('@/pages/timelines/wrenched-timeline')),
  beforeLoad: (options) => {
    const {
      context: { features, instance },
    } = options;
    if (instance.configuration.timelines_access.live_feeds.wrenched !== 'public') {
      requireAuth(options);
    }
    if (!features.wrenchedTimeline) throw notFound();
  },
});

export const remoteTimelineRoute = createRoute({
  getParentRoute: () => layouts.remoteInstance,
  path: '/',
  component: lazy(() => import('@/pages/timelines/remote-timeline')),
  beforeLoad: (options) => {
    const {
      context: { features, instance },
    } = options;
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
  component: lazy(() => import('@/pages/status-lists/conversations')),
  beforeLoad: (options) => {
    const {
      context: { features },
    } = options;
    requireAuth(options);
    if (!features.conversations) throw notFound();
  },
});

// Tags and links
export const hashtagTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/tags/$hashtag',
  component: lazy(() => import('@/pages/timelines/hashtag-timeline')),
  beforeLoad: (options) => {
    const {
      context: { instance },
    } = options;
    if (instance.configuration.timelines_access.hashtag_feeds.local !== 'public') {
      requireAuth(options);
    }
  },
});

export const linkTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/links/$url',
  component: lazy(() => import('@/pages/timelines/link-timeline')),
});

// Lists and circles
export const listsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/lists',
  component: lazy(() => import('@/pages/account-lists/lists')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.lists) throw notFound();
  }),
});

export const listTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/list/$listId',
  component: lazy(() => import('@/pages/timelines/list-timeline')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.lists) throw notFound();
  }),
});

export const circlesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles',
  component: lazy(() => import('@/pages/account-lists/circles')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.circles) throw notFound();
  }),
});

export const circleTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circles/$circleId',
  component: lazy(() => import('@/pages/timelines/circle-timeline')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.circles) throw notFound();
  }),
});

export const antennasRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/antennas',
  component: lazy(() => import('@/pages/account-lists/antennas')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.antennas) throw notFound();
  }),
});

export const antennaTimelineRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/antennas/$antennaId',
  component: lazy(() => import('@/pages/timelines/antenna-timeline')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.antennas) throw notFound();
  }),
});

// Bookmarks
export const bookmarkFoldersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks',
  component: lazy(() => import('@/pages/status-lists/bookmark-folders')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
    if (!features.bookmarkFolders)
      throw redirect({ to: '/bookmarks/$folderId', params: { folderId: 'all' } });
  }),
});

export const bookmarksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/bookmarks/$folderId',
  component: lazy(() => import('@/pages/status-lists/bookmarks')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.bookmarks) throw notFound();
  }),
});

// Notifications
export const notificationsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/notifications',
  component: lazy(() => import('@/pages/notifications/notifications')),
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
  component: lazy(() => import('@/pages/search/search')),
});

export const directoryRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/directory',
  validateSearch: v.object({
    order: v.optional(v.picklist(['active', 'new']), 'active'),
    local: v.optional(v.boolean(), false),
  }),
  component: lazy(() => import('@/pages/account-lists/directory')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.profileDirectory) throw notFound();
  },
});

// Events
export const eventsRoute = createRoute({
  getParentRoute: () => layouts.events,
  path: '/events',
  component: lazy(() => import('@/pages/status-lists/events')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

export const newEventRoute = createRoute({
  getParentRoute: () => layouts.events,
  path: '/events/new',
  component: lazy(() => import('@/pages/statuses/compose-event')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

// Chats
export const chatsRoute = createRoute({
  getParentRoute: () => layouts.chats,
  path: '/chats',
  component: lazy(() => import('@/pages/chats/chats')),
});

export const chatsNewRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/new',
  component: ChatsPageNew,
});

export const chatsSettingsRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/settings',
  component: ChatsPageSettings,
});

export const shoutboxRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/shoutbox',
  component: ChatsPageShoutbox,
});

export const chatRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/$chatId',
  component: ChatsPageChat,
});

export const chatsEmptyRoute = createRoute({
  getParentRoute: () => chatsRoute,
  path: '/',
  component: ChatsPageEmpty,
});

// Follow requests and blocks
export const followRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/follow_requests',
  component: lazy(() => import('@/pages/account-lists/follow-requests')),
  beforeLoad: requireAuth,
});

export const outgoingFollowRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/outgoing_follow_requests',
  component: lazy(() => import('@/pages/account-lists/outgoing-follow-requests')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.outgoingFollowRequests) throw notFound();
  }),
});

export const blocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/blocks',
  component: lazy(() => import('@/pages/settings/blocks')),
  beforeLoad: requireAuth,
});

export const domainBlocksRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/domain_blocks',
  component: lazy(() => import('@/pages/settings/domain-blocks')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.federating) throw notFound();
  }),
});

export const mutesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/mutes',
  component: lazy(() => import('@/pages/settings/mutes')),
  beforeLoad: requireAuth,
});

// Filters
export const filtersRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters',
  component: lazy(() => import('@/pages/settings/filters')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  }),
});

export const editFilterRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/filters/$filterId',
  component: lazy(() => import('@/pages/settings/edit-filter')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.filters && !features.filtersV2) throw notFound();
  }),
});

// Followed tags
export const followedTagsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/followed_tags',
  component: lazy(() => import('@/pages/settings')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.followedHashtagsList) throw notFound();
  }),
});

export const rssFeedSubscriptionsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/rss_feed_subscriptions',
  component: lazy(() => import('@/pages/settings/rss-feed-subscriptions')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.rssFeedSubscriptions) throw notFound();
  }),
});

// Interaction requests
export const interactionRequestsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/interaction_requests',
  component: lazy(() => import('@/pages/status-lists/interaction-requests')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.interactionRequests) throw notFound();
  }),
});

// Profile routes
export const profileRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/',
  component: lazy(() => import('@/pages/accounts/account-timeline')),
  validateSearch: v.object({
    with_replies: v.optional(v.boolean()),
  }),
});

export const profileFollowersRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/followers',
  component: lazy(() => import('@/pages/account-lists/followers')),
});

export const profileFollowingRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/following',
  component: lazy(() => import('@/pages/account-lists/following')),
});

export const profileSubscribersRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/subscribers',
  component: lazy(() => import('@/pages/account-lists/subscribers')),
  validateSearch: v.object({
    include_expired: v.optional(v.boolean(), false),
  }),
});

export const profileMediaRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/media',
  component: lazy(() => import('@/pages/accounts/account-gallery')),
});

export const profileTaggedRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/tagged/$tag',
  component: lazy(() => import('@/pages/accounts/account-timeline')),
});

export const profileFavoritesRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/favorites',
  component: lazy(() => import('@/pages/status-lists/favourited-statuses')),
});

export const profilePinsRoute = createRoute({
  getParentRoute: () => layouts.profile,
  path: '/pins',
  component: lazy(() => import('@/pages/status-lists/pinned-statuses')),
});

// Status routes
export const statusRoute = createRoute({
  getParentRoute: () => layouts.status,
  path: '/@{$username}/posts/$statusId',
  component: lazy(() => import('@/pages/statuses/status')),
});

export const statusQuotesRoute = createRoute({
  getParentRoute: () => layouts.status,
  path: '/@{$username}/posts/$statusId/quotes',
  component: lazy(() => import('@/pages/status-lists/quotes')),
});

// Event routes
export const eventInformationRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/',
  component: lazy(() => import('@/pages/statuses/event-information')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.events) throw notFound();
  },
});

export const eventEditRoute = createRoute({
  getParentRoute: () => layouts.events,
  path: '/@{$username}/events/$statusId/edit',
  component: lazy(() =>
    import('@/pages/statuses/compose-event').then((m) => ({ default: m.EditEventPage })),
  ),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

export const eventDiscussionRoute = createRoute({
  getParentRoute: () => layouts.event,
  path: '/discussion',
  component: lazy(() => import('@/pages/statuses/event-discussion')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.events) throw notFound();
  }),
});

// Groups routes
export const groupsRoute = createRoute({
  getParentRoute: () => layouts.groups,
  path: '/groups',
  component: lazy(() => import('@/pages/groups/groups')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupTimelineRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/',
  component: lazy(() => import('@/pages/timelines/group-timeline')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupMembersRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/members',
  component: lazy(() => import('@/pages/groups/group-members')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupGalleryRoute = createRoute({
  getParentRoute: () => layouts.group,
  path: '/media',
  component: lazy(() => import('@/pages/groups/group-gallery')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const manageGroupRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage',
  component: lazy(() => import('@/pages/groups/manage-group')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const editGroupRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/edit',
  component: lazy(() => import('@/pages/groups/edit-group')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupBlocksRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/blocks',
  component: lazy(() => import('@/pages/groups/group-blocked-members')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

export const groupMembershipRequestsRoute = createRoute({
  getParentRoute: () => layouts.manageGroups,
  path: '/groups/$groupId/manage/requests',
  component: lazy(() => import('@/pages/groups/group-membership-requests')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.groups) throw notFound();
  },
});

// Statuses
export const newStatusRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/statuses/new',
  component: lazy(() => import('@/pages/compose/new-status')),
});

export const scheduledStatusesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/scheduled_statuses',
  component: lazy(() => import('@/pages/status-lists/scheduled-statuses')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.scheduledStatuses) throw notFound();
  }),
});

export const draftStatusesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/draft_statuses',
  component: lazy(() => import('@/pages/status-lists/draft-statuses')),
  beforeLoad: requireAuth,
});

// Drive
export const driveRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/drive/{-$folderId}',
  component: lazy(() => import('@/pages/drive/drive')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.drive) throw notFound();
  }),
});

// Circle
export const circleRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/circle',
  component: lazy(() => import('@/pages/fun/circle')),
  beforeLoad: requireAuth,
});

// Settings routes
export const settingsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings',
  component: lazy(() => import('@/pages/settings/settings')),
  beforeLoad: requireAuth,
});

export const settingsProfileRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/profile',
  component: lazy(() => import('@/pages/settings/edit-profile')),
  beforeLoad: requireAuth,
});

export const settingsExportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/export',
  component: lazy(() => import('@/pages/settings/export-data')),
  beforeLoad: requireAuth,
});

export const settingsImportRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/import',
  component: lazy(() => import('@/pages/settings/import-data')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.importBlocks && !features.importFollows && !features.importMutes)
      throw notFound();
  }),
});

export const settingsAliasesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/aliases',
  component: lazy(() => import('@/pages/settings/aliases')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.manageAccountAliases) throw notFound();
  }),
});

export const settingsMigrationRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/migration',
  component: lazy(() => import('@/pages/settings/migration')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.accountMoving) throw notFound();
  }),
});

export const settingsBackupsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/backups',
  component: lazy(() => import('@/pages/settings/backups')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.accountBackups) throw notFound();
  }),
});

export const settingsEmailRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/email',
  component: lazy(() => import('@/pages/settings/edit-email')),
  beforeLoad: requireAuth,
});

export const settingsPasswordRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/password',
  component: lazy(() => import('@/pages/settings/edit-password')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.changePassword) throw notFound();
  }),
});

export const settingsAccountRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/account',
  component: lazy(() => import('@/pages/settings/delete-account')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.deleteAccount && !features.deleteAccountWithoutPassword) throw notFound();
  }),
});

export const settingsMfaRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/mfa',
  component: lazy(() => import('@/pages/settings/mfa-form')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.manageMfa) throw notFound();
  }),
});

export const settingsTokensRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/tokens',
  component: lazy(() => import('@/pages/settings/auth-token-list')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.sessions) throw notFound();
  }),
});

export const settingsInteractionPoliciesRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/interaction_policies',
  component: lazy(() => import('@/pages/settings/interaction-policies')),
  beforeLoad: requireAuthMiddleware(({ context: { features } }) => {
    if (!features.interactionRequests && !features.quoteApprovalPolicies) throw notFound();
  }),
});

export const settingsPrivacyRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/settings/privacy',
  component: lazy(() => import('@/pages/settings/privacy')),
  beforeLoad: requireAuth,
});

// Frontend config
export const frontendConfigRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/nicolium/config',
  component: lazy(() => import('@/pages/dashboard/frontend-config')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

// Admin routes
export const adminDashboardRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin',
  component: lazy(() => import('@/pages/dashboard/dashboard')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminAccountRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/accounts/$accountId',
  component: lazy(() => import('@/pages/dashboard/account')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminAwaitingApprovalRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/approval',
  component: lazy(() => import('@/pages/dashboard/awaiting-approval')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminReportsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/reports',
  component: lazy(() => import('@/pages/dashboard/reports')),
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
  path: '/nicolium/admin/reports/$reportId',
  component: lazy(() => import('@/pages/dashboard/report')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminLogRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/log',
  component: lazy(() => import('@/pages/dashboard/moderation-log')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminUsersRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/users',
  component: lazy(() => import('@/pages/dashboard/user-index')),
  validateSearch: v.object({
    q: v.optional(v.string()),
  }),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminThemeRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/theme',
  component: lazy(() => import('@/pages/dashboard/theme-editor')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminRelaysRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/relays',
  component: lazy(() => import('@/pages/dashboard/relays')),
  beforeLoad: requireAuthMiddleware(({ context: { isAdmin } }) => {
    if (!isAdmin) throw notFound();
  }),
});

export const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/announcements',
  component: lazy(() => import('@/pages/dashboard/announcements')),
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || !features.announcements) throw notFound();
  }),
});

export const adminDomainsRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/domains',
  component: lazy(() => import('@/pages/dashboard/domains')),
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || !features.domains) throw notFound();
  }),
});

export const adminRulesRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/rules',
  component: lazy(() => import('@/pages/dashboard/rules')),
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || !features.adminRules) throw notFound();
  }),
});

export const adminPleromaConfigRoute = createRoute({
  getParentRoute: () => layouts.admin,
  path: '/nicolium/admin/pleroma-config',
  component: lazy(() => import('@/pages/dashboard/pleroma-config')),
  beforeLoad: requireAuthMiddleware(({ context: { features, isAdmin } }) => {
    if (!isAdmin || !features.pleromaAdminConfig) throw notFound();
  }),
});

// Info and other routes
export const serverInfoRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/info',
  component: lazy(() => import('@/pages/instance/server-info')),
});

export const aboutRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/about/{-$slug}',
  component: lazy(() => import('@/pages/instance/about')),
});

export const shareRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/share',
  component: lazy(() => import('@/pages/compose/share')),
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
  component: lazy(() => import('@/pages/developers/developers')),
  beforeLoad: requireAuth,
});

export const developersAppsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/apps/create',
  component: lazy(() => import('@/pages/developers/create-app')),
  beforeLoad: requireAuth,
});

export const developersSettingsStoreRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/settings_store',
  component: lazy(() => import('@/pages/developers/settings-store')),
  beforeLoad: requireAuth,
});

export const developersSwRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/developers/sw',
  component: lazy(() => import('@/pages/developers/service-worker-info')),
  beforeLoad: requireAuth,
});

export const errorRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/error',
  component: lazy(() => import('@/pages/errors/intentional-error')),
});

export const networkErrorRoute = createRoute({
  getParentRoute: () => layouts.empty,
  path: '/error/network',
  component: lazy(
    () =>
      Promise.reject(
        new TypeError('Failed to fetch dynamically imported module: TEST'),
      ) as Promise<{ default: React.ComponentType<any> }>,
  ),
});

// Crypto donate
export const cryptoDonateRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/donate/crypto',
  component: lazy(() => import('@/pages/instance/crypto-donate')),
  beforeLoad: ({ context: { hasCrypto } }) => {
    if (!hasCrypto) throw notFound();
  },
});

// Federation restrictions
export const federationRestrictionsRoute = createRoute({
  getParentRoute: () => layouts.default,
  path: '/federation_restrictions',
  component: lazy(() => import('@/pages/instance/federation-restrictions')),
  beforeLoad: ({ context: { features } }) => {
    if (!features.federating) throw notFound();
  },
});

// Redirect routes
const redirectPlFeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pl-fe/$',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: ('/nicolium/' + ((params as any)._splat ?? '')) as '/',
    });
  },
});
const redirectTagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$hashtag',
  component: () => {
    const { hashtag } = redirectTagRoute.useParams();
    return <Navigate to='/tags/$hashtag' params={{ hashtag }} replace />;
  },
});
const redirectNoticeStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notice/$statusId',
  component: () => {
    const { statusId } = redirectNoticeStatusRoute.useParams();
    return (
      <Navigate
        to='/@{$username}/posts/$statusId'
        params={{ username: 'undefined', statusId }}
        replace
      />
    );
  },
});
const redirectPleromaStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/@{$username}/statuses/$statusId',
  component: () => {
    const { username, statusId } = redirectPleromaStatusRoute.useParams();
    return <Navigate to='/@{$username}/posts/$statusId' params={{ username, statusId }} replace />;
  },
});
const redirectPleromaUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$username',
  component: () => {
    const { username } = redirectPleromaUsernameRoute.useParams();
    return <Navigate to='/@{$username}' params={{ username }} replace />;
  },
});
const redirectIceshrimpStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes/$statusId',
  component: () => {
    const { statusId } = redirectIceshrimpStatusRoute.useParams();
    return (
      <Navigate
        to='/@{$username}/posts/$statusId'
        params={{ username: 'undefined', statusId }}
        replace
      />
    );
  },
});
const redirectInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration/$token',
  component: () => {
    const { token } = redirectInviteRoute.useParams();
    return <Navigate to='/invite/$token' params={{ token }} replace />;
  },
});
const redirectWithRepliesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/with_replies',
  component: () => {
    const { username } = redirectWithRepliesRoute.useParams();
    return (
      <Navigate to='/@{$username}' params={{ username }} search={{ with_replies: true }} replace />
    );
  },
});

const redirectRoutes = [
  redirectPlFeRoute,
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/timelines/home',
    component: () => <Navigate to='/' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/timelines/public/local',
    component: () => <Navigate to='/timeline/local' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/timelines/public',
    component: () => <Navigate to='/timeline/fediverse' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/timelines/direct',
    component: () => <Navigate to='/conversations' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/main/all',
    component: () => <Navigate to='/timeline/fediverse' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/main/public',
    component: () => <Navigate to='/timeline/local' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/main/friends',
    component: () => <Navigate to='/' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/user-settings',
    component: () => <Navigate to='/settings/profile' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/registration',
    component: () => <Navigate to='/' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: () => <Navigate to='/nicolium/admin' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/terms',
    component: () => <Navigate to='/about/{-$slug}' params={{ slug: undefined }} replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/preferences',
    component: () => <Navigate to='/settings' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/two_factor_authentication_methods',
    component: () => <Navigate to='/settings/mfa' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/applications',
    component: () => <Navigate to='/developers' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/edit',
    component: () => <Navigate to='/settings' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/reset_password',
    component: () => <Navigate to='/reset-password' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/sign_in',
    component: () => <Navigate to='/login' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/sign_out',
    component: () => <Navigate to='/logout' replace />,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/password/new',
    component: () => <Navigate to='/reset-password' replace />,
  }),
  redirectTagRoute,
  redirectNoticeStatusRoute,
  redirectPleromaStatusRoute,
  redirectPleromaUsernameRoute,
  redirectIceshrimpStatusRoute,
  redirectInviteRoute,
  redirectWithRepliesRoute,
];

const routeTree = rootRoute.addChildren([
  layouts.admin.addChildren([
    adminDashboardRoute,
    adminAccountRoute,
    adminAwaitingApprovalRoute,
    adminReportsRoute,
    adminReportRoute,
    adminLogRoute,
    adminUsersRoute,
    adminThemeRoute,
    adminRelaysRoute,
    adminAnnouncementsRoute,
    adminDomainsRoute,
    adminRulesRoute,
    adminPleromaConfigRoute,
  ]),
  layouts.chats.addChildren([
    chatsRoute.addChildren([
      chatsNewRoute,
      chatsSettingsRoute,
      shoutboxRoute,
      chatRoute,
      chatsEmptyRoute,
    ]),
  ]),
  layouts.default.addChildren([
    conversationsRoute,
    hashtagTimelineRoute,
    linkTimelineRoute,
    listsRoute,
    listTimelineRoute,
    circlesRoute,
    circleTimelineRoute,
    antennasRoute,
    antennaTimelineRoute,
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
    rssFeedSubscriptionsRoute,
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
    frontendConfigRoute,
    aboutRoute,
    shareRoute,
    developersRoute,
    developersAppsRoute,
    developersSettingsStoreRoute,
    developersSwRoute,
    cryptoDonateRoute,
    federationRestrictionsRoute,
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
  layouts.event.addChildren([eventInformationRoute, eventDiscussionRoute]),
  layouts.events.addChildren([eventsRoute, newEventRoute, eventEditRoute]),
  layouts.externalLogin.addChildren([loginExternalRoute]),
  layouts.group.addChildren([groupTimelineRoute, groupMembersRoute, groupGalleryRoute]),
  layouts.groups.addChildren([groupsRoute]),
  layouts.home.addChildren([
    homeRoute,
    localTimelineRoute,
    federatedTimelineRoute,
    bubbleTimelineRoute,
    wrenchedTimelineRoute,
  ]),
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
    profileSubscribersRoute,
    profileMediaRoute,
    profileTaggedRoute,
    profileFavoritesRoute,
    profilePinsRoute,
  ]),
  layouts.remoteInstance.addChildren([remoteTimelineRoute]),
  layouts.search.addChildren([searchRoute]),
  layouts.status.addChildren([statusRoute, statusQuotesRoute]),
  ...redirectRoutes,
]);

const FallbackLayout: React.FC<{ children: React.JSX.Element }> = ({ children }) => (
  <>
    <Layout.Main>{children}</Layout.Main>

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
    instance: val.parse(instanceSchema, {}),
    features: {} as Features,
    isLoggedIn: false,
    isAdmin: false,
    hasCrypto: false,
  },
  defaultNotFoundComponent: lazy(() => import('@/pages/errors/generic-not-found')),
  defaultPendingComponent: PendingComponent,
  defaultErrorComponent: SiteError,
  defaultPreload: 'intent',
  scrollRestoration: true,
  pathParamsAllowedCharacters: ['@'],
  // defaultViewTransition: {
  //   types: ({ fromLocation }) => (fromLocation ? [''] : false),
  // },
});

router.subscribe('onBeforeNavigate', (event) => {
  if (!event.fromLocation || event.hashChanged || event.hrefChanged || event.pathChanged) return;
  if (event.fromLocation.state.modalIndex === event.toLocation.state.modalIndex) {
    window.scrollTo(0, 0);
  }
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
  const { cryptoAddresses } = useFrontendConfig();
  const hasCrypto = cryptoAddresses.length > 0;
  const { data: account } = useOwnAccount();

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
      isLoggedIn: !!account,
      isAdmin: !!(account?.is_admin ?? account?.is_moderator),
      hasCrypto,
    }),
    [features.version, hasCrypto, !!account, account?.is_admin, account?.is_moderator],
  );

  return <RouterProvider router={router} context={context} />;
};

export { layouts, rootRoute, router, RouterWithContext };
