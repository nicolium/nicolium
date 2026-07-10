import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import StatusList from '@/components/statuses/status-list';
import Emoji from '@/components/ui/emoji';
import Spinner from '@/components/ui/spinner';
import Tabs from '@/components/ui/tabs';
import { useColumnScrollParent } from '@/contexts/multi-column-context';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReactions,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useStatusQuotes } from '@/queries/statuses/use-status-quotes';

import type { Item } from '@/components/ui/tabs';

const messages = defineMessages({
  all: { id: 'reactions.all', defaultMessage: 'All' },
});

interface IAccountInteractionList {
  accountIds?: Array<string>;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  refetch: () => Promise<unknown>;
  emptyMessage: React.ReactNode;
}

const AccountInteractionList: React.FC<IAccountInteractionList> = ({
  accountIds,
  isLoading,
  hasNextPage,
  fetchNextPage,
  refetch,
  emptyMessage,
}) => {
  const inColumn = !!useColumnScrollParent();

  if (!accountIds) return <Spinner />;

  return (
    <PullToRefresh onRefresh={refetch}>
      <ScrollableList
        emptyMessageText={emptyMessage}
        listClassName='modal__list'
        itemClassName='modal__list__item'
        style={inColumn ? undefined : { height: 'calc(80vh - 88px)' }}
        hasMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => fetchNextPage()}
        useWindowScroll={false}
      >
        {accountIds.map((id) => (
          <AccountContainer key={id} id={id} />
        ))}
      </ScrollableList>
    </PullToRefresh>
  );
};

interface IStatusInteractionList {
  statusId: string;
}

const ReblogsList: React.FC<IStatusInteractionList> = ({ statusId }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = useStatusReblogs(statusId);

  return (
    <AccountInteractionList
      accountIds={data}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={() => fetchNextPage({ cancelRefetch: false })}
      refetch={refetch}
      emptyMessage={
        <FormattedMessage
          id='status.reblogs.empty'
          defaultMessage='No one has reposted this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const FavouritesList: React.FC<IStatusInteractionList> = ({ statusId }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = useStatusFavourites(statusId);

  return (
    <AccountInteractionList
      accountIds={data}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={() => fetchNextPage({ cancelRefetch: false })}
      refetch={refetch}
      emptyMessage={
        <FormattedMessage
          id='empty_column.favourites'
          defaultMessage='No one has liked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const DislikesList: React.FC<IStatusInteractionList> = ({ statusId }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = useStatusDislikes(statusId);

  return (
    <AccountInteractionList
      accountIds={data}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={() => fetchNextPage({ cancelRefetch: false })}
      refetch={refetch}
      emptyMessage={
        <FormattedMessage
          id='empty_column.dislikes'
          defaultMessage='No one has disliked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

interface IAccountWithReaction {
  id: string;
  reaction: string;
  reactionUrl?: string;
  reactions?: Array<{ name: string; url?: string }>;
}

interface IReactionStack {
  reactions: Array<{ name: string; url?: string }>;
}

const ReactionStack: React.FC<IReactionStack> = ({ reactions }) => {
  const [expanded, setExpanded] = useState(false);
  const reactionsToShow = expanded ? reactions : reactions.slice(0, 3);

  return (
    <div
      className={clsx('reaction-stack', expanded && 'reaction-stack--expanded')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (reactions.length > 1) setExpanded((value) => !value);
      }}
    >
      {reactionsToShow.map((reaction, index) => (
        <Emoji
          key={index}
          className='reaction-stack__emoji'
          emoji={reaction.name}
          src={reaction.url}
        />
      ))}
    </div>
  );
};

interface IReactionsList {
  statusId: string;
  reaction?: string;
}

const ReactionsList: React.FC<IReactionsList> = ({ statusId, reaction: initialReaction }) => {
  const intl = useIntl();
  const inColumn = !!useColumnScrollParent();
  const [reaction, setReaction] = useState(initialReaction);

  const { data: reactions, isLoading, refetch } = useStatusReactions(statusId);

  const renderFilterBar = () => {
    const items: Array<Item> = [
      {
        text: intl.formatMessage(messages.all),
        action: () => setReaction(''),
        name: 'all',
      },
    ];

    reactions!.forEach((reaction) =>
      items.push({
        text: (
          <div className='reactions-modal__emoji'>
            <Emoji emoji={reaction.name} src={reaction.url ?? undefined} />
            {reaction.count}
          </div>
        ),
        action: () => setReaction(reaction.name),
        name: reaction.name,
      }),
    );

    return <Tabs items={items} activeItem={reaction ?? 'all'} />;
  };

  const accounts = useMemo((): Array<IAccountWithReaction> | undefined => {
    if (!reactions) return;

    if (reaction) {
      const reactionRecord = reactions.find(({ name }) => name === reaction);

      if (reactionRecord)
        return reactionRecord.account_ids.map((account) => ({
          id: account,
          reaction: reaction,
          reactionUrl: reactionRecord.url ?? undefined,
        }));
    } else {
      const uniqueAccounts = new Set<string>(reactions.flatMap(({ account_ids }) => account_ids));

      return Array.from(uniqueAccounts).map((account) => {
        const accountReactions = reactions.filter(({ account_ids }) =>
          account_ids.includes(account),
        );

        return {
          id: account,
          reaction: accountReactions[0]!.name,
          reactionUrl: accountReactions[0]!.url ?? undefined,
          reactions: accountReactions.map(({ name, url }) => ({ name, url })),
        };
      });
    }
  }, [reactions, reaction]);

  if (!accounts || !reactions) return <Spinner />;

  const emptyMessage = (
    <FormattedMessage
      id='status.reactions.empty'
      defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.'
    />
  );

  return (
    <>
      {reactions.length > 0 && renderFilterBar()}
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          emptyMessageText={emptyMessage}
          listClassName='reactions-modal__list'
          itemClassName='reactions-modal__item'
          style={
            inColumn
              ? undefined
              : { height: reactions.length > 0 ? 'calc(80vh - 159px)' : 'calc(80vh - 88px)' }
          }
          isLoading={isLoading}
          useWindowScroll={false}
        >
          {accounts.map((account) => (
            <AccountContainer
              key={`${account.id}-${account.reaction}`}
              id={account.id}
              emoji={
                account.reactions && account.reactions.length > 1 ? (
                  <ReactionStack reactions={account.reactions} />
                ) : (
                  <Emoji
                    className='account-card__emoji'
                    emoji={account.reaction}
                    src={account.reactionUrl}
                  />
                )
              }
            />
          ))}
        </ScrollableList>
      </PullToRefresh>
    </>
  );
};

const QuotesList: React.FC<IStatusInteractionList> = ({ statusId }) => {
  const {
    data: statusIds = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStatusQuotes(statusId);

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.quotes'
      defaultMessage='This post has not been quoted yet.'
    />
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <StatusList
        loadMoreClassName='status-list__load-more'
        statusIds={statusIds}
        scrollKey={`quotes:${statusId}`}
        hasMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
      />
    </PullToRefresh>
  );
};

export { ReblogsList, FavouritesList, DislikesList, ReactionsList, QuotesList };
