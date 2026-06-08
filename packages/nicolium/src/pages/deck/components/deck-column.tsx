import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useRouter,
} from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import NotificationsColumn from '@/columns/notifications';
import SearchColumn from '@/columns/search';
import {
  AntennaTimelineColumn,
  AccountTimelineColumn,
  BubbleTimelineColumn,
  CircleTimelineColumn,
  HashtagTimelineColumn,
  HomeTimelineColumn,
  ListTimelineColumn,
  PublicTimelineColumn,
  WrenchedTimelineColumn,
} from '@/columns/timeline';
import AccountHeader from '@/components/accounts/account-header';
import MissingIndicator from '@/components/missing-indicator';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Tabs from '@/components/ui/tabs';
import { MultiColumnProvider } from '@/contexts/multi-column-context';
import Thread from '@/features/status/components/thread';
import { ProfileInfoPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useStatus } from '@/queries/statuses/use-status';
import { router as appRouter } from '@/router';
import { useInstance } from '@/stores/instance';

import type { DeckColumn, DeckColumn as DeckColumnSchema } from '@/schemas/frontend-settings';

const searchTabMessages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
});

const messages = defineMessages({
  searchPlaceholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  local: { id: 'column.community', defaultMessage: 'Local timeline' },
  federated: { id: 'column.public', defaultMessage: 'Federated timeline' },
  bubble: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  wrenched: { id: 'column.wrenched', defaultMessage: 'Wrenched timeline' },
  timeline: { id: 'column.deck.timeline', defaultMessage: 'Timeline' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  account: { id: 'column.account', defaultMessage: 'Profile' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  remove: { id: 'column.deck.remove', defaultMessage: 'Remove column' },
  shrink: { id: 'column.deck.width.shrink', defaultMessage: 'Shrink column' },
  widen: { id: 'column.deck.width.widen', defaultMessage: 'Widen column' },
  moveLeft: { id: 'column.deck.position.left', defaultMessage: 'Move column left' },
  moveRight: { id: 'column.deck.position.right', defaultMessage: 'Move column right' },
});

const SEARCH_FILTERS = ['accounts', 'statuses', 'hashtags', 'links'] as const;

const useColumnTitle = (column: DeckColumnSchema): string => {
  const intl = useIntl();

  if (column.type === 'timeline') {
    const prefix = column.timeline.split(':')[0];
    if (prefix in messages) {
      return intl.formatMessage(messages[prefix as keyof typeof messages]);
    }
    return intl.formatMessage(messages.timeline);
  }

  return intl.formatMessage(messages[column.type]);
};

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

const RootRoute: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(() => router.history.canGoBack());

  const handleClickOutside: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    router.history.back();
  };

  useEffect(() => {
    setCanGoBack(router.history.canGoBack());
    return router.history.subscribe(() => setCanGoBack(router.history.canGoBack()));
  }, [router]);

  return (
    <>
      {canGoBack && (
        <div
          role='presentation'
          className='deck__column__overlay'
          aria-hidden
          onClick={handleClickOutside}
        />
      )}
      <div className='deck__column__content' ref={setContent}>
        {canGoBack && <CardHeader onBackClick={() => router.history.back()} />}
        <MultiColumnProvider scrollParent={content}>
          <Outlet />
        </MultiColumnProvider>
      </div>
    </>
  );
};

const DeckEscape: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const { href } = router.state.location;
    appRouter.history.push(href);
    router.history.back();
  }, [router]);

  return null;
};

const rootRoute = createRootRoute({
  component: RootRoute,
  notFoundComponent: DeckEscape,
});

const HomeTimelineDeckColumn = () => <HomeTimelineColumn />;
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomeTimelineDeckColumn,
});

const LocalTimelineDeckColumn = () => <PublicTimelineColumn local />;
const localRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/local',
  component: LocalTimelineDeckColumn,
});

const FederatedTimelineDeckColumn = () => <PublicTimelineColumn />;
const federatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/federated',
  component: FederatedTimelineDeckColumn,
});

const BubbleTimelineDeckColumn = () => <BubbleTimelineColumn />;
const bubbleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bubble',
  component: BubbleTimelineDeckColumn,
});

const WrenchedTimelineDeckColumn = () => <WrenchedTimelineColumn />;
const wrenchedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrenched',
  component: WrenchedTimelineDeckColumn,
});

const ListTimelineDeckColumn = () => {
  const { listId } = listRoute.useParams();
  return <ListTimelineColumn listId={listId} />;
};
const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/list/$listId',
  component: ListTimelineDeckColumn,
});

const CircleTimelineDeckColumn = () => {
  const { circleId } = circleRoute.useParams();
  return <CircleTimelineColumn circleId={circleId} />;
};
const circleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/circle/$circleId',
  component: CircleTimelineDeckColumn,
});

const AntennaTimelineDeckColumn = () => {
  const { antennaId } = antennaRoute.useParams();
  return <AntennaTimelineColumn antennaId={antennaId} />;
};
const antennaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/antenna/$antennaId',
  component: AntennaTimelineDeckColumn,
});

const InstanceTimelineDeckColumn = () => {
  const { instance } = instanceRoute.useParams();
  return <PublicTimelineColumn instance={instance} />;
};
const instanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instance/$instance',
  component: InstanceTimelineDeckColumn,
});

const NotificationsDeckColumn = () => <NotificationsColumn />;
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsDeckColumn,
});

const HashtagDeckColumn = () => {
  const { hashtag } = hashtagRoute.useParams();
  return <HashtagTimelineColumn hashtag={hashtag} />;
};
const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tags/$hashtag',
  component: HashtagDeckColumn,
});

const SearchDeckColumn = () => {
  const intl = useIntl();
  const navigate = useNavigate({ from: searchRoute.fullPath });
  const { q = '', type = 'accounts', accountId } = searchRoute.useSearch();
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  const submit = (query: string) => navigate({ search: (prev) => ({ ...prev, q: query }) });

  const items = SEARCH_FILTERS.filter((filter) => filter !== 'links').map((filter) => ({
    text: intl.formatMessage(searchTabMessages[filter]),
    action: () => navigate({ search: (prev) => ({ ...prev, type: filter }) }),
    name: filter,
  }));

  return (
    <div className='deck-search'>
      <Input
        type='text'
        theme='search'
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        aria-label={intl.formatMessage(messages.searchPlaceholder)}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit(value);
          }
        }}
      />

      <Tabs items={items} activeItem={type} />

      <SearchColumn query={q} type={type} accountId={accountId} />
    </div>
  );
};

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: v.object({
    type: v.optional(v.picklist(SEARCH_FILTERS), 'accounts'),
    q: v.optional(v.string()),
    accountId: v.optional(v.string()),
  }),
  component: SearchDeckColumn,
});

interface IAccountColumnBody {
  account?: React.ComponentProps<typeof ProfileInfoPanel>['account'];
  username: string;
  accountId?: string;
}

const AccountColumnBody: React.FC<IAccountColumnBody> = ({ account, username, accountId }) => (
  <>
    <AccountHeader key={`deck-header-${accountId}`} account={account} />
    <React.Suspense fallback={null}>
      <ProfileInfoPanel
        key={`deck-info-${accountId}`}
        username={username}
        account={account}
        withStatusesLink={false}
      />
    </React.Suspense>
    {accountId && <AccountTimelineColumn accountId={accountId} />}
  </>
);

const AccountDeckColumn = () => {
  const { accountId } = accountRoute.useParams();
  const ownAccount = useOwnAccount();
  const resolvedId = accountId === 'self' ? ownAccount.data?.id : accountId;
  const { data: account } = useAccount(resolvedId);

  return (
    <AccountColumnBody account={account} username={account?.acct ?? ''} accountId={resolvedId} />
  );
};

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/$accountId',
  component: AccountDeckColumn,
});

const AccountByUsernameDeckColumn = () => {
  const { username } = profileRoute.useParams();
  const { data: account } = useAccountLookup(username, true);

  return <AccountColumnBody account={account} username={username} accountId={account?.id} />;
};

const accountByUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}',
  component: AccountByUsernameDeckColumn,
});

const StatusDeckColumn = () => {
  const { statusId } = statusRoute.useParams();
  const { data: status, isPending, refetchContext } = useStatus(statusId, { withContext: true });

  if (!status) {
    if (!isPending) return <MissingIndicator />;
    return <PlaceholderStatus />;
  }

  return <Thread key={status.id} status={status} refetchContext={refetchContext} />;
};

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/posts/$statusId',
  component: StatusDeckColumn,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  localRoute,
  federatedRoute,
  bubbleRoute,
  wrenchedRoute,
  listRoute,
  circleRoute,
  antennaRoute,
  instanceRoute,
  notificationsRoute,
  hashtagRoute,
  searchRoute,
  accountRoute,
  accountByUsernameRoute,
  statusRoute,
]);

const getInitialUrl = (column: DeckColumnSchema) => {
  switch (column.type) {
    case 'notifications':
      return '/notifications';
    case 'account':
      return `/account/${column.accountId ?? 'self'}`;
    case 'search': {
      const params = new URLSearchParams();
      if (column.query) params.set('q', column.query);
      if (column.searchType) params.set('type', column.searchType);
      const search = params.toString();
      return search ? `/search?${search}` : '/search';
    }
    case 'timeline': {
      const { timeline } = column;
      const [prefix, value] = timeline.split(':');
      switch (prefix) {
        case 'list':
        case 'circle':
        case 'antenna':
        case 'instance':
          return `/${prefix}/${value}`;
        case 'local':
        case 'federated':
        case 'bubble':
        case 'wrenched':
        case 'home':
          return `/${prefix}`;
        default:
          return '/home';
      }
    }
    default:
      return '/home';
  }
};

const columnSignature = (column: DeckColumnSchema): string => {
  switch (column.type) {
    case 'timeline':
      return `timeline:${column.timeline}`;
    case 'notifications':
      return 'notifications';
    case 'account':
      return `account:${column.accountId ?? 'self'}`;
    case 'search':
      return `search:${column.searchType}:${column.query}`;
    default:
      return 'unknown';
  }
};

const createColumnRouter = (initialUrl: string) =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    defaultNotFoundComponent: DeckEscape,
  });

type ColumnRouter = ReturnType<typeof createColumnRouter>;

const registry = new Map<string, { router: ColumnRouter; signature: string }>();

const getDeckColumnRouter = (column: DeckColumnSchema): ColumnRouter => {
  const signature = columnSignature(column);
  const cached = registry.get(column.id);

  if (cached && cached.signature === signature) return cached.router;

  const router = createColumnRouter(getInitialUrl(column));
  registry.set(column.id, { router, signature });
  return router;
};

const pruneDeckColumnRouters = (activeIds: Array<string>) => {
  const active = new Set(activeIds);
  for (const id of registry.keys()) {
    if (!active.has(id)) registry.delete(id);
  }
};

interface IDeckColumn {
  column: DeckColumnSchema;
}

const DeckColumn: React.FC<IDeckColumn> = ({ column }) => {
  const instance = useInstance();
  const features = useFeatures();
  const title = useColumnTitle(column);
  const router = getDeckColumnRouter(column);

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
    }),
    [features.version],
  );

  return (
    <div className={`deck__column deck__column--${column.columnWidth}`}>
      <CardHeader className='deck__column__header'>
        <CardTitle title={title} />
      </CardHeader>
      <RouterProvider router={router} context={context} />
    </div>
  );
};

export { DeckColumn, pruneDeckColumnRouters };
