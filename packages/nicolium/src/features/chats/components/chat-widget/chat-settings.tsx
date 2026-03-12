import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import List, { ListItem } from '@/components/list';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useFeatures } from '@/hooks/use-features';
import {
  useUnblockAccountMutation,
  useRelationshipQuery,
} from '@/queries/accounts/use-relationship';
import { useDeleteChat } from '@/queries/chats';
import { useModalsActions } from '@/stores/modals';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
  leaveMessage: {
    id: 'chat_settings.leave.message',
    defaultMessage:
      'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.',
  },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
});

const ChatSettings = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { openModal } = useModalsActions();
  const { chat, changeScreen, toggleChatPane } = useChatContext();
  const deleteChat = useDeleteChat(chat?.id as string);

  const { mutate: unblockAccount } = useUnblockAccountMutation(chat?.account.id!);

  const isBlocked = !!useRelationshipQuery(chat?.account.id).data?.blocked_by;

  const closeSettings = () => {
    changeScreen(ChatWidgetScreens.CHAT, chat?.id);
  };

  const minimizeChatPane = () => {
    closeSettings();
    toggleChatPane();
  };

  const handleBlockUser = () => {
    openModal('BLOCK_MUTE', {
      accountId: chat?.account.id!,
      action: 'BLOCK',
    });
  };

  const handleUnblockUser = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: (
        <FormattedMessage
          id='chat_settings.unblock.message'
          defaultMessage='Unblocking will allow this profile to direct message you and view your content.'
        />
      ),
      confirm: intl.formatMessage(messages.unblockConfirm),
      onConfirm: () => {
        unblockAccount();
      },
    });
  };

  const handleLeaveChat = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveHeading),
      message: (
        <FormattedMessage
          id='chat_settings.leave.message'
          defaultMessage='Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.'
        />
      ),
      confirm: intl.formatMessage(messages.leaveConfirm),
      onConfirm: () => {
        deleteChat.mutate();
      },
    });
  };

  if (!chat) {
    return null;
  }

  return (
    <>
      <ChatPaneHeader
        isOpen
        isToggleable={false}
        onToggle={minimizeChatPane}
        title={
          <div className='flex items-center gap-2'>
            <button onClick={closeSettings} title={intl.formatMessage(messages.back)}>
              <Icon
                src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
              />
            </button>

            <Text weight='semibold'>
              <FormattedMessage id='chat_settings.title' defaultMessage='Chat details' />
            </Text>
          </div>
        }
      />

      <div className='flex flex-col gap-4 px-4'>
        <Account account={chat.account} hideActions />

        <List>
          <ListItem
            label={
              isBlocked ? (
                <FormattedMessage
                  id='chat_settings.options.unblock_user'
                  defaultMessage='Unblock @{acct}'
                  values={{ acct: chat.account.acct }}
                />
              ) : (
                <FormattedMessage
                  id='chat_settings.options.block_user'
                  defaultMessage='Block @{acct}'
                  values={{ acct: chat.account.acct }}
                />
              )
            }
            onClick={isBlocked ? handleUnblockUser : handleBlockUser}
            size='sm'
          />
          {features.chatsDelete && (
            <ListItem
              label={
                <FormattedMessage
                  id='chat_settings.options.leave_chat'
                  defaultMessage='Leave chat'
                />
              }
              onClick={handleLeaveChat}
              size='sm'
            />
          )}
        </List>
      </div>
    </>
  );
};

export { ChatSettings as default };
