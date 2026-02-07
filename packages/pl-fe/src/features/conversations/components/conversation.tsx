import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { markConversationRead } from '@/actions/conversations';
import StatusContainer from '@/containers/status-container';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { selectAccount } from '@/selectors';

interface IConversation {
  conversationId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const Conversation: React.FC<IConversation> = ({ conversationId, onMoveUp, onMoveDown }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { accounts, unread, lastStatusId } = useAppSelector((state) => {
    const conversation = state.conversations.items.find(x => x.id === conversationId)!;

    return {
      accounts: conversation.accounts.map((accountId: string) => selectAccount(state, accountId)!),
      unread: conversation.unread,
      lastStatusId: conversation.last_status,
    };
  });

  const handleClick = () => {
    if (unread) {
      dispatch(markConversationRead(conversationId));
    }

    if (lastStatusId) navigate({ to: '/@{$username}/posts/$statusId', params: { username: accounts[0].acct, statusId: lastStatusId } });
  };

  const handleHotkeyMoveUp = () => {
    onMoveUp(conversationId);
  };

  const handleHotkeyMoveDown = () => {
    onMoveDown(conversationId);
  };

  if (lastStatusId === null) {
    return null;
  }

  return (
    // @ts-ignore
    <StatusContainer
      id={lastStatusId}
      unread={unread}
      otherAccounts={accounts}
      onMoveUp={handleHotkeyMoveUp}
      onMoveDown={handleHotkeyMoveDown}
      onClick={handleClick}
      variant='slim'
    />
  );
};

export { Conversation as default };
