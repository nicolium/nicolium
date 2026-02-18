import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { markConversationRead } from '@/actions/conversations';
import { useAccount } from '@/api/hooks/accounts/use-account';
import StatusContainer from '@/containers/status-container';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';

interface IConversation {
  conversationId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const Conversation: React.FC<IConversation> = ({ conversationId, onMoveUp, onMoveDown }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    account_ids,
    unread,
    last_status: lastStatusId,
  } = useAppSelector((state) => state.conversations.items.find((x) => x.id === conversationId)!);
  const { account: lastStatusAccount } = useAccount(account_ids[0]);

  const handleClick = () => {
    if (unread) {
      dispatch(markConversationRead(conversationId));
    }

    if (lastStatusId)
      navigate({
        to: '/@{$username}/posts/$statusId',
        params: { username: lastStatusAccount?.acct || 'undefined', statusId: lastStatusId },
      });
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
    <StatusContainer
      id={lastStatusId}
      unread={unread}
      // otherAccounts={accounts}
      onMoveUp={handleHotkeyMoveUp}
      onMoveDown={handleHotkeyMoveDown}
      onClick={handleClick}
      variant='slim'
    />
  );
};

export { Conversation as default };
