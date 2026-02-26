import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import StatusContainer from '@/containers/status-container';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useMarkConversationRead,
  type MinifiedConversation,
} from '@/queries/conversations/use-conversations';

interface IConversation {
  conversation: MinifiedConversation;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const Conversation: React.FC<IConversation> = ({ conversation, onMoveUp, onMoveDown }) => {
  const navigate = useNavigate();

  const { id: conversationId, account_ids, unread, last_status: lastStatusId } = conversation;
  const { mutate: markConversationRead } = useMarkConversationRead(conversationId);
  const { data: lastStatusAccount } = useAccount(account_ids[0]);

  const handleClick = () => {
    if (unread) {
      markConversationRead();
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
