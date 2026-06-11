import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import {
  createRootRoute,
  createRoute,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import { changeSetting } from '@/actions/settings';
import { BookmarksColumn } from '@/columns/bookmarks';
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
import TrendsColumn from '@/columns/trends';
import AccountHeader from '@/components/accounts/account-header';
import MissingIndicator from '@/components/missing-indicator';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import { CardHeader, CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Tabs from '@/components/ui/tabs';
import { MultiColumnProvider } from '@/contexts/multi-column-context';
import Thread from '@/features/status/components/thread';
import { ProfileInfoPanel } from '@/features/ui/util/async-components';
import { useOwnAccount } from '@/hooks/use-own-account';
import HashtagFollowToggle from '@/pages/timelines/components/hashtag-follow-toggle';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';
import { useStatus } from '@/queries/statuses/use-status';
import { router as appRouter } from '@/router';
import { useSettings } from '@/stores/settings';

import { messages, useDeckColumnConfig } from './deck-column-config';

import type { FilterType } from '@/queries/notifications/use-notifications';
import type { DeckColumn } from '@/schemas/frontend-settings';
import type { MessageDescriptor } from 'react-intl';

const searchTabMessages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
});

const SEARCH_FILTERS = ['accounts', 'statuses', 'hashtags', 'links'] as const;

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
        hashtag?: string;
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
  const hashtag = leaf.routeId === hashtagRoute.id ? leaf.params.hashtag : undefined;

  const canAddColumn =
    (!!accountId &&
      !columns.some((column) => column.type === 'account' && column.accountId === accountId)) ||
    (!!hashtag &&
      !columns.some((column) => column.type === 'hashtag' && column.hashtag === hashtag));

  const handleAddColumn = () => {
    if (!accountId && !hashtag) return;
    changeSetting(['deck', 'columns'], (current: Array<DeckColumn>) => [
      ...current,
      {
        id: crypto.randomUUID(),
        columnWidth: 'md',
        ...(hashtag
          ? { type: 'hashtag', hashtag }
          : {
              type: 'account',
              accountId,
              excludeReplies: false,
              showPinned: true,
            }),
      },
    ]);
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
            {canAddColumn && (
              <IconButton
                className='deck__column__add-column'
                src={iconPlus}
                onClick={handleAddColumn}
                title={intl.formatMessage(messages.addColumn)}
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
  return (
    <>
      <HashtagFollowToggle hashtag={hashtag} />
      <HashtagTimelineColumn hashtag={hashtag} />
    </>
  );
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
    navigate({ search: (prev) => ({ ...prev, q: query }), replace: true });
    updateColumn({ query });
  };

  const items = (['accounts', 'statuses', 'hashtags'] as const).map((filter) => ({
    text: intl.formatMessage(searchTabMessages[filter]),
    action: () => {
      navigate({ search: (prev) => ({ ...prev, type: filter }), replace: true });
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

const TrendingDeckColumn = () => {
  const { trendsType } = trendingRoute.useParams();

  switch (trendsType) {
    case 'accounts':
      return <TrendsColumn type='accounts' />;
    case 'statuses':
      return <TrendsColumn type='statuses' />;
    case 'links':
      return <TrendsColumn type='links' />;
    default:
      return <TrendsColumn type='hashtags' />;
  }
};

const trendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trending/$trendsType',
  component: TrendingDeckColumn,
  staticData: { title: messages.search },
});

const BookmarksDeckColumn = () => {
  const { folderId } = bookmarksRoute.useParams();

  return <BookmarksColumn folderId={folderId === 'all' ? undefined : folderId} />;
};

const bookmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookmarks/$folderId',
  component: BookmarksDeckColumn,
  staticData: { title: messages.bookmarks },
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
  trendingRoute,
  bookmarksRoute,
  accountRoute,
  accountByUsernameRoute,
  statusRoute,
]);

export { routeTree, DeckEscape };
