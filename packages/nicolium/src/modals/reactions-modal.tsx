import React, { useMemo, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Emoji from '@/components/ui/emoji';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Tabs from '@/components/ui/tabs';
import { useStatusReactions } from '@/queries/statuses/use-status-interactions';

import type { Item } from '@/components/ui/tabs';
import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  all: { id: 'reactions.all', defaultMessage: 'All' },
});

interface IAccountWithReaction {
  id: string;
  reaction: string;
  reactionUrl?: string;
}

interface ReactionsModalProps {
  statusId: string;
  reaction?: string;
}

const ReactionsModal: React.FC<BaseModalProps & ReactionsModalProps> = ({
  onClose,
  statusId,
  reaction: initialReaction,
}) => {
  const intl = useIntl();
  const [reaction, setReaction] = useState(initialReaction);

  const { data: reactions, isLoading, refetch } = useStatusReactions(statusId);

  const onClickClose = () => {
    onClose('REACTIONS');
  };

  const renderFilterBar = () => {
    const items: Array<Item> = [
      {
        text: intl.formatMessage(messages.all),
        action: () => {
          setReaction('');
        },
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
        action: () => {
          setReaction(reaction.name);
        },
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
      return reactions.flatMap(({ account_ids, name, url }) =>
        account_ids.map((account) => ({
          id: account,
          reaction: name,
          reactionUrl: url ?? undefined,
        })),
      );
    }
  }, [reactions, reaction]);

  let body;

  if (!accounts || !reactions) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='status.reactions.empty'
        defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.'
      />
    );

    body = (
      <>
        {reactions.length > 0 && renderFilterBar()}
        <PullToRefresh onRefresh={refetch}>
          <ScrollableList
            emptyMessageText={emptyMessage}
            listClassName='reactions-modal'
            itemClassName='reactions-modal__item'
            style={{ height: reactions.length > 0 ? 'calc(80vh - 159px)' : 'calc(80vh - 88px)' }}
            isLoading={isLoading}
            useWindowScroll={false}
          >
            {accounts.map((account) => (
              <AccountContainer
                key={`${account.id}-${account.reaction}`}
                id={account.id}
                emoji={account.reaction}
                emojiUrl={account.reactionUrl}
              />
            ))}
          </ScrollableList>
        </PullToRefresh>
      </>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reactions' defaultMessage='Reactions' />}
      onClose={onClickClose}
      className='reactions-modal'
    >
      {body}
    </Modal>
  );
};

export { ReactionsModal as default, type ReactionsModalProps };
