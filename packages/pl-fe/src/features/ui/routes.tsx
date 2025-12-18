import { createRootRoute, createRoute } from '@tanstack/react-router';

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

import UI from '.';

const rootRoute = createRootRoute({
  component: UI,
});

const layouts = {
  admin: createRoute({ getParentRoute: () => rootRoute, id: 'admin-layout', component: AdminLayout }),
  chats: createRoute({ getParentRoute: () => rootRoute, id: 'chats-layout', component: ChatsLayout }),
  default: createRoute({ getParentRoute: () => rootRoute, id: 'default-layout', component: DefaultLayout }),
  empty: createRoute({ getParentRoute: () => rootRoute, id: 'empty-layout', component: EmptyLayout }),
  event: createRoute({ getParentRoute: () => rootRoute, id: 'event-layout', component: EventLayout }),
  events: createRoute({ getParentRoute: () => rootRoute, id: 'events-layout', component: EventsLayout }),
  externalLogin: createRoute({ getParentRoute: () => rootRoute, id: 'external-login-layout', component: ExternalLoginLayout }),
  group: createRoute({ getParentRoute: () => rootRoute, id: 'group-layout', component: GroupLayout }),
  groups: createRoute({ getParentRoute: () => rootRoute, id: 'groups-layout', component: GroupsLayout }),
  home: createRoute({ getParentRoute: () => rootRoute, id: 'home-layout', component: HomeLayout }),
  landing: createRoute({ getParentRoute: () => rootRoute, id: 'landing-layout', component: LandingLayout }),
  manageGroups: createRoute({ getParentRoute: () => rootRoute, id: 'manage-groups-layout', component: ManageGroupsLayout }),
  profile: createRoute({ getParentRoute: () => rootRoute, id: 'profile-layout', component: ProfileLayout }),
  remoteInstance: createRoute({ getParentRoute: () => rootRoute, id: 'remote-instance-layout', component: RemoteInstanceLayout }),
  search: createRoute({ getParentRoute: () => rootRoute, id: 'search-layout', component: SearchLayout }),
  status: createRoute({ getParentRoute: () => rootRoute, id: 'status-layout', component: StatusLayout }),
};
