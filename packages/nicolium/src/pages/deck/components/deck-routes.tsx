import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import { createRootRoute, createRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { clsx } from 'clsx';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import { BookmarksColumn } from '@/columns/bookmarks';
import CollectionColumn from '@/columns/collection';
import AccountCollectionsColumn from '@/columns/collections';
import DraftStatusesColumn from '@/columns/draft-statuses';
import { FollowersList, FollowingList, SubscribersList } from '@/columns/follows';
import NotificationsColumn from '@/columns/notifications';
import ScheduledStatusesColumn from '@/columns/scheduled-statuses';
import SearchColumn from '@/columns/search';
import {
  DislikesList,
  FavouritesList,
  QuotesList,
  ReactionsList,
  ReblogsList,
} from '@/columns/status-interactions';
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
import { ComposeForm, ProfileInfoPanel } from '@/components/async-components';
import Chat from '@/components/chats/chat';
import ChatList from '@/components/chats/chat-list';
import { Hotkeys } from '@/components/hotkeys';
import MissingIndicator from '@/components/missing-indicator';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import Thread from '@/components/statuses/thread';
import { CardHeader, CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Tabs from '@/components/ui/tabs';
import { DeckColumnIdContext } from '@/contexts/deck-column-id-context';
import { MultiColumnProvider } from '@/contexts/multi-column-context';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { DriveBrowser } from '@/pages/drive/components/drive-browser';
import { AccountFilter } from '@/pages/search/components/account-filter';
import HashtagFollowToggle from '@/pages/timelines/components/hashtag-follow-toggle';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useChat } from '@/queries/chats';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';
import { useStatus } from '@/queries/statuses/use-status';
import { router as appRouter } from '@/router';
import { useUploadCompose } from '@/stores/compose';

import { useActiveDeckColumns, updateActiveLayoutColumns } from '../utils/layouts';
import { deckMessages as messages } from '../utils/messages';

import { useDeckColumnConfig, useColumnRouteTitle, useColumnFilters } from './deck-column-config';
import { DeckColumnSearch } from './deck-column-search';

import type { FilterType } from '@/queries/notifications/use-notifications';
import type { DeckColumn } from '@/schemas/frontend-settings';
import type { Chat as ChatEntity } from 'pl-api';

const searchTabMessages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
});

const SEARCH_FILTERS = ['accounts', 'statuses', 'hashtags', 'links'] as const;

const RootRoute: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const columns = useActiveDeckColumns();
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(() => router.history.canGoBack());
  const scopeUrl = useScopeUrl();

  const { title, accountId, hashtag, chatId, folderId } = useColumnRouteTitle();

  const canAddColumn =
    (!!accountId &&
      !columns.some((column) => column.type === 'account' && column.accountId === accountId)) ||
    (!!hashtag &&
      !columns.some((column) => column.type === 'hashtag' && column.hashtag === hashtag)) ||
    (!!chatId && !columns.some((column) => column.type === 'chat' && column.chatId === chatId)) ||
    (!!folderId &&
      !columns.some((column) => column.type === 'drive' && column.folderId === folderId));

  const handleAddColumn = () => {
    if (!accountId && !hashtag && !chatId) return;
    updateActiveLayoutColumns((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        columnWidth: 'md',
        accountUrl: scopeUrl,
        ...(hashtag
          ? { type: 'hashtag', hashtag }
          : chatId
            ? { type: 'chat', chatId }
            : {
                type: 'account',
                accountId,
                excludeReplies: false,
                showPinned: false,
              }),
      } as DeckColumn,
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
            {title && <CardTitle title={title} />}
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

const HomeTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();

  return <HomeTimelineColumn filters={filters} />;
};
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomeTimelineDeckColumn,
  staticData: { title: messages.home },
});

const LocalTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();

  return <PublicTimelineColumn local filters={filters} />;
};
const localRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/local',
  component: LocalTimelineDeckColumn,
  staticData: { title: messages.local },
});

const FederatedTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();

  return <PublicTimelineColumn filters={filters} />;
};
const federatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/federated',
  component: FederatedTimelineDeckColumn,
  staticData: { title: messages.federated },
});

const BubbleTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();

  return <BubbleTimelineColumn filters={filters} />;
};
const bubbleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bubble',
  component: BubbleTimelineDeckColumn,
  staticData: { title: messages.bubble },
});

const WrenchedTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();

  return <WrenchedTimelineColumn filters={filters} />;
};
const wrenchedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrenched',
  component: WrenchedTimelineDeckColumn,
  staticData: { title: messages.wrenched },
});

const ListTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();
  const { listId } = listRoute.useParams();

  return <ListTimelineColumn listId={listId} filters={filters} />;
};
const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/list/$listId',
  component: ListTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const CircleTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();
  const { circleId } = circleRoute.useParams();

  return <CircleTimelineColumn circleId={circleId} filters={filters} />;
};
const circleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/circle/$circleId',
  component: CircleTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const AntennaTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();
  const { antennaId } = antennaRoute.useParams();

  return <AntennaTimelineColumn antennaId={antennaId} filters={filters} />;
};
const antennaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/antenna/$antennaId',
  component: AntennaTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const InstanceTimelineDeckColumn: React.FC = () => {
  const filters = useColumnFilters();
  const { instance } = instanceRoute.useParams();

  return <PublicTimelineColumn instance={instance} filters={filters} />;
};
const instanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instance/$instance',
  component: InstanceTimelineDeckColumn,
  staticData: { title: messages.timeline },
});

const NotificationsDeckColumn: React.FC = () => {
  const [column, updateColumn] =
    useDeckColumnConfig<Extract<DeckColumn, { type: 'notifications' }>>();

  return (
    <NotificationsColumn
      filter={column?.filter ?? 'all'}
      onChangeFilter={(filter: FilterType) => updateColumn({ filter })}
      advanced
    />
  );
};
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsDeckColumn,
  staticData: { title: messages.notifications },
});

const HashtagDeckColumn: React.FC = () => {
  const filters = useColumnFilters();
  const [column] = useDeckColumnConfig<Extract<DeckColumn, { type: 'hashtag' }>>();
  const { hashtag } = hashtagRoute.useParams();

  return (
    <>
      <HashtagFollowToggle hashtag={hashtag} />
      <HashtagTimelineColumn
        hashtag={hashtag}
        any={column?.any}
        all={column?.all}
        none={column?.none}
        filters={filters}
      />
    </>
  );
};

const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tags/$hashtag',
  component: HashtagDeckColumn,
  staticData: { title: messages.hashtag },
});

const HashtagPickerDeckColumn: React.FC = () => {
  const [, updateColumn] = useDeckColumnConfig<Extract<DeckColumn, { type: 'hashtag' }>>();
  return <DeckColumnSearch mode='hashtag' onSelect={(hashtag) => updateColumn({ hashtag })} />;
};

const hashtagPickerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tags',
  component: HashtagPickerDeckColumn,
  staticData: { title: messages.hashtag },
});

const SearchDeckColumn: React.FC = () => {
  const intl = useIntl();
  const { history } = useRouter();
  const navigate = useNavigate({ from: searchRoute.fullPath });
  const { q = '', type = 'accounts', accountId } = searchRoute.useSearch();
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  const [, updateColumn] = useDeckColumnConfig<Extract<DeckColumn, { type: 'search' }>>();

  const submit = (query: string) => {
    const hasHistory = history.canGoBack();
    navigate({ search: (prev) => ({ ...prev, q: query }), replace: !hasHistory });
    if (!hasHistory) updateColumn({ query });
  };

  const items = (['accounts', 'statuses', 'hashtags'] as const).map((filter) => ({
    text: intl.formatMessage(searchTabMessages[filter]),
    action: () => {
      const hasHistory = history.canGoBack();
      navigate({ search: (prev) => ({ ...prev, type: filter }), replace: !hasHistory });
      if (!hasHistory) updateColumn({ searchType: filter });
    },
    name: filter,
  }));

  const unsetAccount = () => {
    const hasHistory = history.canGoBack();
    navigate({ search: ({ accountId, ...prev }) => prev, replace: !hasHistory });
  };

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

      {accountId ? (
        <AccountFilter accountId={accountId} handleUnsetAccount={unsetAccount} />
      ) : (
        <Tabs items={items} activeItem={type} />
      )}

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

const TrendingDeckColumn: React.FC = () => {
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

const BookmarksDeckColumn: React.FC = () => {
  const { folderId } = bookmarksRoute.useParams();

  return <BookmarksColumn folderId={folderId === 'all' ? undefined : folderId} />;
};

const bookmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookmarks/$folderId',
  component: BookmarksDeckColumn,
  staticData: { title: messages.bookmarks },
});

const scheduledStatusesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scheduled_statuses',
  component: () => <ScheduledStatusesColumn />,
  staticData: { title: messages.scheduled },
});

const draftStatusesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/draft_statuses',
  component: () => <DraftStatusesColumn />,
  staticData: { title: messages.drafts },
});

const ComposeDeckColumn: React.FC = () => {
  const columnId = useContext(DeckColumnIdContext);
  const composeId = `deck:${columnId}`;
  const composeBlock = useRef<HTMLDivElement>(null);

  const uploadCompose = useUploadCompose(composeId);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    uploadCompose(files);
  });

  return (
    <div
      className={clsx('deck__column__compose', {
        'deck__column__compose--dragging': isDragging,
        'deck__column__compose--dragged-over': isDraggedOver,
      })}
      ref={composeBlock}
    >
      <ComposeForm
        id={composeId}
        autoFocus={false}
        transparent
        showAccountSwitcher
        expandAccountSwitcher
        enableThread
      />
    </div>
  );
};

const composeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compose',
  component: ComposeDeckColumn,
  staticData: { title: messages.compose },
});

interface IAccountColumnBody {
  account?: React.ComponentProps<typeof ProfileInfoPanel>['account'];
  username: string;
  accountId?: string;
  excludeReplies?: boolean;
  featuredStatusIds?: Array<string>;
}

const ChatsDeckColumn: React.FC = () => {
  const navigate = useNavigate();
  const handleClickChat = (chat: ChatEntity | 'shoutbox') => {
    if (chat === 'shoutbox') return;
    navigate({ to: '/chats/$chatId', params: { chatId: chat.id } });
  };

  return (
    <div className='deck-chats'>
      <ChatList onClickChat={handleClickChat} />
    </div>
  );
};

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: ChatsDeckColumn,
  staticData: { title: messages.chats },
});

const ChatDeckColumn: React.FC = () => {
  const { chatId } = chatRoute.useParams();
  const { data: chat } = useChat(chatId);

  if (!chat) return null;

  return <Chat chat={chat} />;
};

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats/$chatId',
  component: ChatDeckColumn,
  staticData: { title: messages.chats },
});

const AccountColumnBody: React.FC<IAccountColumnBody> = ({
  account,
  username,
  accountId,
  excludeReplies,
  featuredStatusIds,
}) => (
  <>
    <AccountHeader key={`deck-header-${accountId}`} account={account} />
    <ProfileInfoPanel
      key={`deck-info-${accountId}`}
      username={username}
      account={account}
      withStatusesLink={false}
    />
    {accountId && (
      <AccountTimelineColumn
        accountId={accountId}
        excludeReplies={excludeReplies}
        featuredStatusIds={featuredStatusIds}
        emptyMessageText={
          <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
        }
      />
    )}
  </>
);

const AccountDeckColumn: React.FC = () => {
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

const AccountByUsernameDeckColumn: React.FC = () => {
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

const AccountPickerDeckColumn: React.FC = () => {
  const [, updateColumn] = useDeckColumnConfig<Extract<DeckColumn, { type: 'account' }>>();
  return <DeckColumnSearch mode='account' onSelect={(accountId) => updateColumn({ accountId })} />;
};

const accountPickerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountPickerDeckColumn,
  staticData: { title: messages.account },
});

const StatusDeckColumn: React.FC = () => {
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
  path: '/@{-$username}/posts/$statusId',
  component: StatusDeckColumn,
  staticData: { title: messages.status },
});

const ReblogsDeckColumn: React.FC = () => {
  const { statusId } = reblogsRoute.useParams();
  return <ReblogsList statusId={statusId} />;
};
const reblogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{-$username}/posts/$statusId/reblogs',
  component: ReblogsDeckColumn,
  staticData: { title: messages.reblogs },
});

const QuotesDeckColumn: React.FC = () => {
  const { statusId } = quotesRoute.useParams();
  return <QuotesList statusId={statusId} />;
};
const quotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{-$username}/posts/$statusId/quotes',
  component: QuotesDeckColumn,
  staticData: { title: messages.quotes },
});

const FavouritesDeckColumn: React.FC = () => {
  const { statusId } = favouritesRoute.useParams();
  return <FavouritesList statusId={statusId} />;
};
const favouritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{-$username}/posts/$statusId/favourites',
  component: FavouritesDeckColumn,
  staticData: { title: messages.favourites },
});

const DislikesDeckColumn: React.FC = () => {
  const { statusId } = dislikesRoute.useParams();
  return <DislikesList statusId={statusId} />;
};
const dislikesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{-$username}/posts/$statusId/dislikes',
  component: DislikesDeckColumn,
  staticData: { title: messages.dislikes },
});

const ReactionsDeckColumn: React.FC = () => {
  const { statusId } = reactionsRoute.useParams();
  return <ReactionsList statusId={statusId} />;
};
const reactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{-$username}/posts/$statusId/reactions',
  component: ReactionsDeckColumn,
  staticData: { title: messages.reactions },
});

const FollowersDeckColumn: React.FC = () => {
  const { username } = followersRoute.useParams();
  return <FollowersList username={username} />;
};
const followersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/followers',
  component: FollowersDeckColumn,
  staticData: { title: messages.followers },
});

const FollowingDeckColumn: React.FC = () => {
  const { username } = followingRoute.useParams();
  return <FollowingList username={username} />;
};
const followingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/following',
  component: FollowingDeckColumn,
  staticData: { title: messages.following },
});

const SubscribersDeckColumn: React.FC = () => {
  const { username } = subscribersRoute.useParams();
  return <SubscribersList username={username} />;
};
const subscribersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/subscribers',
  component: SubscribersDeckColumn,
  staticData: { title: messages.subscribers },
});

const CollectionsDeckColumn: React.FC = () => {
  const { username } = collectionsRoute.useParams();
  return <AccountCollectionsColumn username={username} />;
};
const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/@{$username}/collections',
  component: CollectionsDeckColumn,
  staticData: { title: messages.collections },
});

const CollectionDeckColumn: React.FC = () => {
  const { collectionId } = collectionRoute.useParams();
  return <CollectionColumn collectionId={collectionId} />;
};
const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionId',
  component: CollectionDeckColumn,
  staticData: { title: messages.collection },
});

const DriveDeckColumn: React.FC = () => {
  const { folderId } = driveRoute.useParams();
  const [column, updateColumn] = useDeckColumnConfig<Extract<DeckColumn, { type: 'drive' }>>();

  useEffect(() => {
    if (column && column.folderId !== folderId) {
      updateColumn({ folderId });
    }
  }, [folderId]);

  const handlers = {
    columnBack: (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('.drive-file')) {
        (event.target as HTMLElement).closest<HTMLElement>('.deck__column')?.focus();
      } else {
        return false;
      }
    },
  };

  return (
    <Hotkeys handlers={handlers}>
      <DriveBrowser folderId={folderId} />
    </Hotkeys>
  );
};
const driveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/drive/{-$folderId}',
  component: DriveDeckColumn,
  staticData: { title: messages.drive },
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
  hashtagPickerRoute,
  searchRoute,
  trendingRoute,
  bookmarksRoute,
  scheduledStatusesRoute,
  draftStatusesRoute,
  composeRoute,
  chatsRoute,
  chatRoute,
  accountRoute,
  accountByUsernameRoute,
  accountPickerRoute,
  followersRoute,
  followingRoute,
  subscribersRoute,
  collectionsRoute,
  collectionRoute,
  statusRoute,
  reblogsRoute,
  quotesRoute,
  favouritesRoute,
  dislikesRoute,
  reactionsRoute,
  driveRoute,
]);

export {
  routeTree,
  DeckEscape,
  accountRoute,
  accountByUsernameRoute,
  antennaRoute,
  bookmarksRoute,
  bubbleRoute,
  chatRoute,
  circleRoute,
  federatedRoute,
  hashtagRoute,
  homeRoute,
  instanceRoute,
  listRoute,
  localRoute,
  trendingRoute,
  wrenchedRoute,
  driveRoute,
};
