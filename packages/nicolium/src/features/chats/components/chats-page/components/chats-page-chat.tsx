import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconInfo from '@phosphor-icons/core/regular/info.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import { AccountLink } from '@/components/accounts/account-link';
import VerificationBadge from '@/components/accounts/verification-badge';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Avatar from '@/components/ui/avatar';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import {
  useUnblockAccountMutation,
  useRelationshipQuery,
} from '@/queries/accounts/use-relationship';
import { useChat, useDeleteChat } from '@/queries/chats';
import { chatRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

import Chat from '../../chat';

const messages = defineMessages({
  blockMessage: {
    id: 'chat_settings.block.message',
    defaultMessage:
      'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.',
  },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  unblockMessage: {
    id: 'chat_settings.unblock.message',
    defaultMessage:
      'Unblocking will allow this profile to direct message you and view your content.',
  },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
  leaveMessage: {
    id: 'chat_settings.leave.message',
    defaultMessage:
      'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.',
  },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  unblockUser: { id: 'chat_settings.options.unblock_user', defaultMessage: 'Unblock @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
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
      onConfirm: () => {
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
      icon: iconProhibit,
      text: intl.formatMessage(isBlocked ? messages.unblockUser : messages.blockUser, {
        acct: chat.account.acct,
      }),
      action: isBlocked ? handleUnblockUser : handleBlockUser,
    },
  ];

  if (features.chatsDelete)
    menuItems.push({
      icon: iconSignOut,
      text: intl.formatMessage(messages.leaveChat),
      action: handleLeaveChat,
    });

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex w-full items-center justify-between gap-2 p-4'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center'>
            <IconButton
              src={iconArrowLeft}
              className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
              onClick={() => navigate({ to: '/chats' })}
              title={intl.formatMessage(messages.back)}
            />

            <AccountLink account={chat.account}>
              <Avatar
                src={chat.account.avatar}
                alt={chat.account.avatar_description}
                size={40}
                className='flex-none'
                isCat={chat.account.is_cat}
                username={chat.account.username}
              />
            </AccountLink>
          </div>

          <div className='flex h-11 flex-col items-start overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <AccountLink account={chat.account}>
                <Text weight='bold' size='sm' align='left' truncate>
                  {chat.account.display_name || `@${chat.account.username}`}
                </Text>
              </AccountLink>
              {chat.account.verified && <VerificationBadge />}
            </div>
          </div>
        </div>

        <DropdownMenu
          src={iconInfo}
          component={() => (
            <div className='px-4 py-2'>
              <Account account={chat.account} disabled hideActions />
            </div>
          )}
          items={menuItems}
        />
      </div>

      <div className='h-full overflow-hidden'>
        <Chat className='h-full' chat={chat} inputRef={inputRef} />
      </div>
    </div>
  );
};

export { ChatsPageChat as default };
