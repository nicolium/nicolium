import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu from 'pl-fe/components/dropdown-menu';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useChatContext } from 'pl-fe/contexts/chat-context';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useRelationshipQuery } from 'pl-fe/queries/accounts/use-relationship';
import { useChatActions } from 'pl-fe/queries/chats';
import { useModalsActions } from 'pl-fe/stores/modals';

import type { Chat } from 'pl-api';
import type { Menu } from 'pl-fe/components/dropdown-menu';

const messages = defineMessages({
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
  settings: { id: 'chat_list_item.settings', defaultMessage: 'Chat settings' },
});

interface IChatListItemInterface {
  chat: Chat;
  onClick: (chat: any) => void;
}

const ChatListItem: React.FC<IChatListItemInterface> = ({ chat, onClick }) => {
  const { openModal } = useModalsActions();
  const intl = useIntl();
  const features = useFeatures();
  const navigate = useNavigate();

  const { isUsingMainChatPage } = useChatContext();
  const { deleteChat } = useChatActions(chat?.id as string);
  const { data: relationship } = useRelationshipQuery(chat?.account.id);

  const isBlocked = relationship?.blocked_by && false;
  const isBlocking = relationship?.blocking && false;

  const menu = useMemo((): Menu => [{
    text: intl.formatMessage(messages.leaveChat),
    action: (event) => {
      event.stopPropagation();

      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.leaveHeading),
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        onConfirm: () => {
          deleteChat.mutate(undefined, {
            onSuccess() {
              if (isUsingMainChatPage) {
                navigate({ to: '/chats' });
              }
            },
          });
        },
      });
    },
    icon: require('@phosphor-icons/core/regular/sign-out.svg'),
  }], []);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick(chat);
    }
  };

  return (
    <div
      role='button'
      key={chat.id}
      onClick={() => onClick(chat)}
      onKeyDown={handleKeyDown}
      className='⁂-chat-list-item'
      data-testid='chat-list-item'
      tabIndex={0}
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar
            src={chat.account.avatar}
            alt={chat.account.avatar_description}
            size={40}
            className='flex-none'
            isCat={chat.account.is_cat}
            username={chat.account.username}
          />

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {(isBlocked || isBlocking) ? (
              <Text
                align='left'
                size='sm'
                weight='medium'
                theme='muted'
                truncate
                className='pointer-events-none h-5 w-full italic'
                data-testid='chat-last-message'
              >
                {isBlocked
                  ? <FormattedMessage id='chat_list_item.blocked_you' defaultMessage='This user has blocked you' />
                  : <FormattedMessage id='chat_list_item.blocking' defaultMessage='You have blocked this user' />}
              </Text>
            ) : (
              <>
                {chat.last_message?.content && (
                  <Text
                    align='left'
                    size='sm'
                    weight='medium'
                    theme={chat.last_message.unread ? 'default' : 'muted'}
                    truncate
                    className='truncate-child pointer-events-none h-5 w-full'
                    data-testid='chat-last-message'
                  >
                    <ParsedContent html={chat.last_message?.content} emojis={chat.last_message.emojis} />
                  </Text>
                )}
              </>
            )}
          </Stack>
        </HStack>

        <HStack alignItems='center' space={2}>
          {features.chatsDelete && (
            <div className='⁂-chat-list-item__menu'>
              <DropdownMenu items={menu}>
                <IconButton
                  src={require('@phosphor-icons/core/regular/dots-three.svg')}
                  title={intl.formatMessage(messages.settings)}
                />
              </DropdownMenu>
            </div>
          )}

          {chat.last_message && (
            <>
              {chat.last_message.unread && (
                <div
                  className='size-2 rounded-full bg-secondary-500'
                  data-testid='chat-unread-indicator'
                />
              )}

              <RelativeTimestamp
                timestamp={chat.last_message.created_at}
                align='right'
                size='xs'
                theme={chat.last_message.unread ? 'default' : 'muted'}
                truncate
              />
            </>
          )}
        </HStack>
      </HStack>
    </div>
  );
};

export { ChatListItem as default };
