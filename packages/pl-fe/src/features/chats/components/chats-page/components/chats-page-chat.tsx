import { Link, useNavigate } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Account from '@/components/account';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import VerificationBadge from '@/components/verification-badge';
import { chatRoute } from '@/features/ui/router';
import { useFeatures } from '@/hooks/use-features';
import { useUnblockAccountMutation, useRelationshipQuery } from '@/queries/accounts/use-relationship';
import { useChat, useDeleteChat } from '@/queries/chats';
import { useModalsActions } from '@/stores/modals';

import Chat from '../../chat';

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
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  unblockUser: { id: 'chat_settings.options.unblock_user', defaultMessage: 'Unblock @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
});

const ChatsPageChat = () => {
  const intl = useIntl();
  const features = useFeatures();
  const navigate = useNavigate();

  const { chatId } = chatRoute.useParams();

  const { openModal } = useModalsActions();
  const { data: chat } = useChat(chatId);

  const { mutate: unblockAccount } = useUnblockAccountMutation(chat?.account.id!);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const deleteChat = useDeleteChat(chat?.id as string);

  const isBlocked = !!useRelationshipQuery(chat?.account.id).data?.blocked_by;

  const handleBlockUser = () => {
    openModal('BLOCK_MUTE', {
      accountId: chat!.account.id,
      action: 'BLOCK',
    });
  };

  const handleUnblockUser = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.unblockMessage),
      confirm: intl.formatMessage(messages.unblockConfirm),
      onConfirm: () =>{
        unblockAccount();
      },
    });
  };

  const handleLeaveChat = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveHeading),
      message: intl.formatMessage(messages.leaveMessage),
      confirm: intl.formatMessage(messages.leaveConfirm),
      onConfirm: () => {
        deleteChat.mutate(undefined, {
          onSuccess() {
            navigate({ to: '/chats' });
          },
        });
      },
    });
  };

  if (!chat) {
    return null;
  }

  const menuItems: Menu = [
    {
      icon: require('@phosphor-icons/core/regular/prohibit.svg'),
      text: intl.formatMessage(isBlocked ? messages.unblockUser : messages.blockUser, { acct: chat.account.acct }),
      action: isBlocked ? handleUnblockUser : handleBlockUser,
    },
  ];

  if (features.chatsDelete) menuItems.push({
    icon: require('@phosphor-icons/core/regular/sign-out.svg'),
    text: intl.formatMessage(messages.leaveChat),
    action: handleLeaveChat,
  });

  return (
    <Stack className='h-full overflow-hidden'>
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full p-4'>
        <HStack alignItems='center' space={2}>
          <HStack alignItems='center'>
            <IconButton
              src={require('@phosphor-icons/core/regular/arrow-left.svg')}
              className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
              onClick={() => navigate({ to: '/chats' })}
            />

            <Link to='/@{$username}' params={{ username: chat.account.acct }}>
              <Avatar src={chat.account.avatar} alt={chat.account.avatar_description} size={40} className='flex-none' isCat={chat.account.is_cat} username={chat.account.username} />
            </Link>
          </HStack>

          <Stack alignItems='start' className='h-11 overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Link to='/@{$username}' params={{ username: chat.account.acct }}>
                <Text weight='bold' size='sm' align='left' truncate>
                  {chat.account.display_name || `@${chat.account.username}`}
                </Text>
              </Link>
              {chat.account.verified && <VerificationBadge />}
            </div>
          </Stack>
        </HStack>

        <DropdownMenu
          src={require('@phosphor-icons/core/regular/info.svg')}
          component={() => <div className='px-4 py-2'><Account account={chat.account} disabled hideActions /></div>}
          items={menuItems}
        />
      </HStack>

      <div className='h-full overflow-hidden'>
        <Chat
          className='h-full'
          chat={chat}
          inputRef={inputRef}
        />
      </div>
    </Stack>
  );
};

export { ChatsPageChat as default };
