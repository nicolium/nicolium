import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { ChatWidgetScreens, useChatContext } from 'pl-fe/contexts/chat-context';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useBlockAccountMutation, useUnblockAccountMutation, useRelationshipQuery } from 'pl-fe/queries/accounts/use-relationship';
import { useChatActions } from 'pl-fe/queries/chats';
import { useModalsActions } from 'pl-fe/stores/modals';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow this profile to direct message you and view your content.' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  title: { id: 'chat_settings.title', defaultMessage: 'Chat Details' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  unblockUser: { id: 'chat_settings.options.unblock_user', defaultMessage: 'Unblock @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
});

const ChatSettings = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { openModal } = useModalsActions();
  const { chat, changeScreen, toggleChatPane } = useChatContext();
  const { deleteChat } = useChatActions(chat?.id as string);

  const { mutate: blockAccount } = useBlockAccountMutation(chat?.account.id!);
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
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.blockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.blockMessage),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => blockAccount(),
    });
  };

  const handleUnblockUser = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.unblockMessage),
      confirm: intl.formatMessage(messages.unblockConfirm),
      onConfirm: () => unblockAccount(),
    });
  };

  const handleLeaveChat = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveHeading),
      message: intl.formatMessage(messages.leaveMessage),
      confirm: intl.formatMessage(messages.leaveConfirm),
      onConfirm: () => deleteChat.mutate(),
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
          <HStack alignItems='center' space={2}>
            <button onClick={closeSettings}>
              <Icon
                src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
              />
            </button>

            <Text weight='semibold'>
              {intl.formatMessage(messages.title)}
            </Text>
          </HStack>
        }
      />

      <Stack space={4} className='mx-auto w-5/6'>
        <HStack alignItems='center' space={3}>
          <Avatar src={chat.account.avatar} staticSrc={chat.account.avatar_static} alt={chat.account.avatar_description} size={50} isCat={chat.account.is_cat} username={chat.account.username} />
          <Stack>
            <Text weight='semibold'>{chat.account.display_name}</Text>
            <Text size='sm' theme='primary'>@{chat.account.acct}</Text>
          </Stack>
        </HStack>

        <Stack space={5}>
          <button onClick={isBlocked ? handleUnblockUser : handleBlockUser} className='flex w-full items-center space-x-2 text-sm font-bold text-primary-600 dark:text-accent-blue'>
            <Icon src={require('@phosphor-icons/core/regular/prohibit.svg')} className='size-5' />
            <span>{intl.formatMessage(isBlocked ? messages.unblockUser : messages.blockUser, { acct: chat.account.acct })}</span>
          </button>

          {features.chatsDelete && (
            <button onClick={handleLeaveChat} className='flex w-full items-center space-x-2 text-sm font-bold text-danger-600'>
              <Icon src={require('@phosphor-icons/core/regular/sign-out.svg')} className='size-5' />
              <span>{intl.formatMessage(messages.leaveChat)}</span>
            </button>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export { ChatSettings as default };
