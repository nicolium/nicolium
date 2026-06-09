import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import iconChevronsLeftRight from 'lucide-static/icons/chevrons-left-right.svg';
import iconChevronsRightLeft from 'lucide-static/icons/chevrons-right-left.svg';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import { changeSetting } from '@/actions/settings';
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
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import { useTimelineHeading } from '@/components/timeline-picker';
import { CardHeader, CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Tabs from '@/components/ui/tabs';
import { MultiColumnProvider } from '@/contexts/multi-column-context';
import Thread from '@/features/status/components/thread';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { ProfileInfoPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';
import { useStatus } from '@/queries/statuses/use-status';
import { router as appRouter } from '@/router';
import { useInstance } from '@/stores/instance';
import { useSettings, useSettingsStore } from '@/stores/settings';

import type { FilterType } from '@/queries/notifications/use-notifications';
import type { DeckColumn } from '@/schemas/frontend-settings';
import type { MessageDescriptor } from 'react-intl';

const WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const searchTabMessages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
});

const messages = defineMessages({
  searchPlaceholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  local: { id: 'column.community', defaultMessage: 'Local timeline' },
  federated: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  bubble: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  wrenched: { id: 'column.wrenched', defaultMessage: 'Wrenched timeline' },
  timeline: { id: 'column.deck.timeline', defaultMessage: 'Timeline' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  account: { id: 'column.account', defaultMessage: 'Profile' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  status: { id: 'column.status', defaultMessage: 'Post' },
  hashtag: { id: 'column.hashtag', defaultMessage: 'Hashtag' },
  remove: { id: 'column.deck.remove', defaultMessage: 'Remove column' },
  shrink: { id: 'column.deck.width.shrink', defaultMessage: 'Shrink column' },
  widen: { id: 'column.deck.width.widen', defaultMessage: 'Widen column' },
  moveLeft: { id: 'column.deck.position.left', defaultMessage: 'Move column left' },
  moveRight: { id: 'column.deck.position.right', defaultMessage: 'Move column right' },
  showReplies: { id: 'timeline_filters.show_replies', defaultMessage: 'Show replies' },
  showPinned: { id: 'column.deck.account.show_pinned', defaultMessage: 'Show pinned posts' },
  addProfileColumn: {
    id: 'column.deck.add_profile',
    defaultMessage: 'Add profile to deck',
  },
});

const SEARCH_FILTERS = ['accounts', 'statuses', 'hashtags', 'links'] as const;

const DeckColumnIdContext = createContext<string | null>(null);

const updateDeckColumn = (columnId: string, changes: Partial<DeckColumn>) => {
  const { columns } = useSettingsStore.getState().settings.deck;
  changeSetting(
    ['deck', 'columns'],
    columns.map((column) => (column.id === columnId ? { ...column, ...changes } : column)),
  );
};

const useDeckColumnConfig = <T extends DeckColumn>() => {
  const columnId = useContext(DeckColumnIdContext);
  const column = useSettings().deck.columns.find((item) => item.id === columnId) as T | undefined;

  const update = (changes: Partial<T>) => {
    if (columnId) updateDeckColumn(columnId, changes);
  };

  return [column, update] as const;
};

const useColumnTitle = (column: DeckColumn): string => {
  const intl = useIntl();
  const timelineHeading = useTimelineHeading(
    column.type === 'timeline' ? (column.timeline as any) : null,
  );
  const { data: ownAccount } = useOwnAccount();
  const { data: account } = useAccount(
    column.type === 'account' && column.accountId ? column.accountId : undefined,
  );

  if (column.type === 'timeline') {
    return timelineHeading;
  }

  if (column.type === 'account') {
    const acct = column.accountId === 'self' ? ownAccount?.acct : account?.acct;
    if (acct !== undefined) return `@${acct}`;
  }

  return intl.formatMessage(messages[column.type]);
};

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

const RootRoute: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const columns = useSettings().deck.columns;
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(() => router.history.canGoBack());

  const { title, leaf } = useRouterState({
    select: (state) => {
      const match = state.matches[state.matches.length - 1];
      const params = (match?.params ?? {}) as {
        username?: string;
        accountId?: string;
        statusId?: string;
      };
      return {
        title: (match?.staticData as { title?: MessageDescriptor } | undefined)?.title,
        leaf: { routeId: match?.routeId as string | undefined, params },
      };
    },
  });

  const username = leaf.routeId === accountByUsernameRoute.id ? leaf.params.username : undefined;
  const { data: lookedUpAccount } = useAccountLookup(username);
  const accountId =
    leaf.routeId === accountByUsernameRoute.id
      ? lookedUpAccount?.id
      : leaf.routeId === accountRoute.id && !leaf.params.statusId
        ? leaf.params.accountId
        : undefined;

  const canAddProfile =
    !!accountId &&
    !columns.some((column) => column.type === 'account' && column.accountId === accountId);

  const handleAddProfile = () => {
    if (!accountId) return;
    const current = useSettingsStore.getState().settings.deck.columns;
    changeSetting(
      ['deck', 'columns'],
      [
        ...current,
        {
          id: crypto.randomUUID(),
          columnWidth: 'md',
          type: 'account',
          accountId,
          excludeReplies: false,
          showPinned: true,
        },
      ],
    );
  };

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
        {canGoBack && (
          <CardHeader onBackClick={() => router.history.back()}>
            {title && (
              <CardTitle
                title={lookedUpAccount ? `@${lookedUpAccount.acct}` : intl.formatMessage(title)}
              />
            )}
            {canAddProfile && (
              <IconButton
                className='deck__column__add-profile'
                src={iconPlus}
                onClick={handleAddProfile}
                title={intl.formatMessage(messages.addProfileColumn)}
              />
            )}
          </CardHeader>
        )}
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
  staticData: { title: messages.home },
});

const LocalTimelineDeckColumn = () => <PublicTimelineColumn local />;
const localRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/local',
  component: LocalTimelineDeckColumn,
  staticData: { title: messages.local },
});

const FederatedTimelineDeckColumn = () => <PublicTimelineColumn />;
const federatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/federated',
  component: FederatedTimelineDeckColumn,
  staticData: { title: messages.federated },
});

const BubbleTimelineDeckColumn = () => <BubbleTimelineColumn />;
const bubbleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bubble',
  component: BubbleTimelineDeckColumn,
  staticData: { title: messages.bubble },
});

const WrenchedTimelineDeckColumn = () => <WrenchedTimelineColumn />;
const wrenchedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrenched',
  component: WrenchedTimelineDeckColumn,
  staticData: { title: messages.wrenched },
});

const ListTimelineDeckColumn = () => {
  const { listId } = listRoute.useParams();
  return <ListTimelineColumn listId={listId} />;
};
const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/list/$listId',
  component: ListTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const CircleTimelineDeckColumn = () => {
  const { circleId } = circleRoute.useParams();
  return <CircleTimelineColumn circleId={circleId} />;
};
const circleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/circle/$circleId',
  component: CircleTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const AntennaTimelineDeckColumn = () => {
  const { antennaId } = antennaRoute.useParams();
  return <AntennaTimelineColumn antennaId={antennaId} />;
};
const antennaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/antenna/$antennaId',
  component: AntennaTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const InstanceTimelineDeckColumn = () => {
  const { instance } = instanceRoute.useParams();
  return <PublicTimelineColumn instance={instance} />;
};
const instanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instance/$instance',
  component: InstanceTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const NotificationsDeckColumn = () => {
  const [column, updateColumn] =
    useDeckColumnConfig<Extract<DeckColumn, { type: 'notifications' }>>();

  return (
    <NotificationsColumn
      filter={column?.filter ?? 'all'}
      onChangeFilter={(filter: FilterType) => updateColumn({ filter })}
    />
  );
};
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsDeckColumn,
  staticData: { title: messages.notifications },
});

const HashtagDeckColumn = () => {
  const { hashtag } = hashtagRoute.useParams();
  return <HashtagTimelineColumn hashtag={hashtag} />;
};
const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tags/$hashtag',
  component: HashtagDeckColumn,
  staticData: { title: messages.hashtag },
});

const SearchDeckColumn = () => {
  const intl = useIntl();
  const navigate = useNavigate({ from: searchRoute.fullPath });
  const { q = '', type = 'accounts', accountId } = searchRoute.useSearch();
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  const [, updateColumn] = useDeckColumnConfig<Extract<DeckColumn, { type: 'search' }>>();

  const submit = (query: string) => {
    navigate({ search: (prev) => ({ ...prev, q: query }) });
    updateColumn({ query });
  };

  const items = (['accounts', 'statuses', 'hashtags'] as const).map((filter) => ({
    text: intl.formatMessage(searchTabMessages[filter]),
    action: () => {
      navigate({ search: (prev) => ({ ...prev, type: filter }) });
      updateColumn({ searchType: filter });
    },
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
  staticData: { title: messages.search },
});

interface IAccountColumnBody {
  account?: React.ComponentProps<typeof ProfileInfoPanel>['account'];
  username: string;
  accountId?: string;
  excludeReplies?: boolean;
  featuredStatusIds?: Array<string>;
}

const AccountColumnBody: React.FC<IAccountColumnBody> = ({
  account,
  username,
  accountId,
  excludeReplies,
  featuredStatusIds,
}) => (
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
    {accountId && (
      <AccountTimelineColumn
        accountId={accountId}
        excludeReplies={excludeReplies}
        featuredStatusIds={featuredStatusIds}
      />
    )}
  </>
);

const AccountDeckColumn = () => {
  const { accountId } = accountRoute.useParams();
  const ownAccount = useOwnAccount();
  const resolvedId = accountId === 'self' ? ownAccount.data?.id : accountId;
  const { data: account } = useAccount(resolvedId);
  const [column] = useDeckColumnConfig<Extract<DeckColumn, { type: 'account' }>>();
  const { data: featuredStatusIds } = usePinnedStatuses(resolvedId ?? '');

  return (
    <AccountColumnBody
      account={account}
      username={account?.acct ?? ''}
      accountId={resolvedId}
      excludeReplies={column?.excludeReplies}
      featuredStatusIds={column?.showPinned ? featuredStatusIds : undefined}
    />
  );
};

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/$accountId',
  component: AccountDeckColumn,
  staticData: { title: messages.account },
});

const AccountByUsernameDeckColumn = () => {
  const { username } = accountByUsernameRoute.useParams();
  const { data: account } = useAccountLookup(username, true);

  return <AccountColumnBody account={account} username={username} accountId={account?.id} />;
};

const accountByUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}',
  component: AccountByUsernameDeckColumn,
  staticData: { title: messages.account },
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
  staticData: { title: messages.status },
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

const getInitialUrl = (column: DeckColumn) => {
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

const columnSignature = (column: DeckColumn): string => {
  switch (column.type) {
    case 'timeline':
      return `timeline:${column.timeline}`;
    case 'notifications':
      return 'notifications';
    case 'account':
      return `account:${column.accountId ?? 'self'}`;
    case 'search':
      return 'search';
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

const getDeckColumnRouter = (column: DeckColumn): ColumnRouter => {
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
  column: DeckColumn;
  index: number;
  columns: number;
  highlight?: boolean;
  onRemove: (id: string) => void;
  onChangeWidth: (id: string, newWidth: (typeof WIDTHS)[number]) => void;
  onChangeIndex: (id: string, newIndex: number) => void;
}

const DeckColumn: React.FC<IDeckColumn> = ({
  column,
  index,
  columns,
  highlight,
  onRemove,
  onChangeWidth,
  onChangeIndex,
}) => {
  const intl = useIntl();
  const instance = useInstance();
  const features = useFeatures();
  const title = useColumnTitle(column);
  const router = getDeckColumnRouter(column);
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight) {
      columnRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'center',
      });
      columnRef.current?.focus();
    }
  }, [highlight]);

  const items = useMemo(() => {
    const handleWiden = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) + 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleShrink = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) - 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleMoveLeft = () => {
      onChangeIndex(column.id, index - 1);
    };

    const handleMoveRight = () => {
      onChangeIndex(column.id, index + 1);
    };

    const menu: Menu = [
      {
        text: intl.formatMessage(messages.widen),
        icon: iconChevronsLeftRight,
        action: handleWiden,
        disabled: column.columnWidth === 'xl',
      },
      {
        text: intl.formatMessage(messages.shrink),
        icon: iconChevronsRightLeft,
        action: handleShrink,
        disabled: column.columnWidth === 'xs',
      },
      {
        text: intl.formatMessage(messages.moveLeft),
        icon: iconArrowLeft,
        action: handleMoveLeft,
        disabled: index === 0,
      },
      {
        text: intl.formatMessage(messages.moveRight),
        icon: iconArrowRight,
        action: handleMoveRight,
        disabled: index === columns - 1,
      },
      null,
      {
        text: intl.formatMessage(messages.remove),
        icon: iconTrash,
        action: () => onRemove(column.id),
        destructive: true,
      },
    ];

    if (column.type === 'account') {
      menu.unshift(
        {
          text: intl.formatMessage(messages.showReplies),
          type: 'toggle',
          checked: !column.excludeReplies,
          onChange: (value) => updateDeckColumn(column.id, { excludeReplies: !value }),
        },
        {
          text: intl.formatMessage(messages.showPinned),
          type: 'toggle',
          checked: column.showPinned,
          onChange: (value) => updateDeckColumn(column.id, { showPinned: value }),
        },
        null,
      );
    }

    return menu;
  }, [intl, index, columns, column]);

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
    }),
    [features.version],
  );

  const handlers = {
    focusPreviousColumn: () => {
      console.log('focus previous column handler', index);
      const prevIndex = index - 1;
      if (prevIndex < 0) return;
      const prevColumn = document.querySelector<HTMLDivElement>(
        `.deck__column[data-index="${prevIndex}"]`,
      );
      console.log('focus previous column', prevIndex, prevColumn);
      prevColumn?.focus();
    },
    focusNextColumn: () => {
      const nextIndex = index + 1;
      if (nextIndex >= columns) return;
      const nextColumn = document.querySelector<HTMLDivElement>(
        `.deck__column[data-index="${nextIndex}"]`,
      );
      console.log('focus next column', nextIndex, nextColumn);
      nextColumn?.focus();
    },
    moveDown: () => {
      if (!columnRef.current) return;
      console.log(columnRef.current);
      columnRef.current.querySelector<HTMLDivElement>('.focusable')?.focus();
    },
  };

  return (
    <Hotkeys
      handlers={handlers}
      ref={columnRef}
      className={clsx('deck__column', `deck__column--${column.columnWidth}`, {
        'deck__column--highlight': highlight,
      })}
      tabIndex={-1}
      data-index={index}
      data-column-id={column.id}
    >
      <CardHeader className='deck__column__header'>
        <CardTitle title={title} />
        <div className='deck__column__actions'>
          <DropdownMenu items={items} src={iconDotsThreeVertical} />
        </div>
      </CardHeader>
      <DeckColumnIdContext.Provider value={column.id}>
        <RouterProvider router={router} context={context} />
      </DeckColumnIdContext.Provider>
    </Hotkeys>
  );
};

export { DeckColumn, pruneDeckColumnRouters };
