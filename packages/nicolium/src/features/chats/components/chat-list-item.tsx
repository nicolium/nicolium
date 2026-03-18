import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import VerificationBadge from '@/components/accounts/verification-badge';
import DropdownMenu from '@/components/dropdown-menu';
import RelativeTimestamp from '@/components/relative-timestamp';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Avatar from '@/components/ui/avatar';
import IconButton from '@/components/ui/icon-button';
import { useChatContext } from '@/contexts/chat-context';
import Emojify from '@/features/emoji/emojify';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useFeatures } from '@/hooks/use-features';
import { useRelationshipQuery } from '@/queries/accounts/use-relationship';
import { useDeleteChat } from '@/queries/chats';
import { useModalsActions } from '@/stores/modals';

import type { Menu } from '@/components/dropdown-menu';
import type { Chat } from 'pl-api';

const messages = defineMessages({
  leaveMessage: {
    id: 'chat_settings.leave.message',
    defaultMessage:
      'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.',
  },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
  settings: { id: 'chat_list_item.settings', defaultMessage: 'Chat settings' },
});

interface IChatListItem {
  chat: Chat;
  onClick: (chat: Chat) => void;
  onMoveUp?: (chatId: string) => void;
  onMoveDown?: (chatId: string) => void;
}

const ChatListItem: React.FC<IChatListItem> = React.memo(
  ({ chat, onClick, onMoveUp, onMoveDown }) => {
    const { openModal } = useModalsActions();
    const intl = useIntl();
    const features = useFeatures();
    const navigate = useNavigate();

    const { isUsingMainChatPage } = useChatContext();
    const deleteChat = useDeleteChat(chat?.id);
    const { data: relationship } = useRelationshipQuery(chat?.account.id);

    const isBlocked = relationship?.blocked_by && false;
    const isBlocking = relationship?.blocking && false;

    const menu = useMemo(
      (): Menu => [
        {
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
          icon: iconSignOut,
        },
      ],
      [],
    );

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        onClick(chat);
      }
    };

    const handleMoveUp = () => {
      if (onMoveUp) {
        onMoveUp(chat.id);
      }
    };

    const handleMoveDown = () => {
      if (onMoveDown) {
        onMoveDown(chat.id);
      }
    };

    const handlers = {
      moveUp: handleMoveUp,
      moveDown: handleMoveDown,
    };

    return (
      <Hotkeys
        handlers={handlers}
        className='px-2'
        tabIndex={0}
        role='button'
        key={chat.id}
        onClick={() => {
          onClick(chat);
        }}
        onKeyDown={handleKeyDown}
      >
        <div className='⁂-chat-list-item' data-testid='chat-list-item'>
          <div>
            <div className='⁂-chat-list-item__info'>
              <Avatar
                src={chat.account.avatar}
                alt={chat.account.avatar_description}
                size={40}
                className='⁂-chat-list-item__avatar'
                isCat={chat.account.is_cat}
                username={chat.account.username}
              />

              <div className='⁂-chat-list-item__content'>
                <div className='⁂-chat-list-item__name'>
                  <p>
                    <Emojify text={chat.account.display_name} emojis={chat.account.emojis} />
                  </p>
                  {chat.account?.verified && <VerificationBadge />}
                </div>

                <p
                  className={clsx('⁂-chat-list-item__message', {
                    '⁂-chat-list-item__message--unread':
                      !(isBlocked ?? isBlocking) && chat.last_message?.unread,
                    '⁂-chat-list-item__message--blocking': isBlocked ?? isBlocking,
                  })}
                >
                  {isBlocked ? (
                    <FormattedMessage
                      id='chat_list_item.blocked_you'
                      defaultMessage='This user has blocked you'
                    />
                  ) : isBlocking ? (
                    <FormattedMessage
                      id='chat_list_item.blocking'
                      defaultMessage='You have blocked this user'
                    />
                  ) : (
                    chat.last_message?.content && (
                      <ParsedContent
                        html={chat.last_message?.content}
                        emojis={chat.last_message.emojis}
                      />
                    )
                  )}
                </p>
              </div>
            </div>

            <div className='⁂-chat-list-item__actions'>
              {features.chatsDelete && (
                <div className='⁂-chat-list-item__menu'>
                  <DropdownMenu items={menu}>
                    <IconButton src={iconDotsThree} title={intl.formatMessage(messages.settings)} />
                  </DropdownMenu>
                </div>
              )}

              {chat.last_message && (
                <>
                  {chat.last_message.unread && (
                    <div className='⁂-chat-list-item__unread' data-testid='chat-unread-indicator' />
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
            </div>
          </div>
        </div>
      </Hotkeys>
    );
  },
);

ChatListItem.displayName = 'ChatListItem';

export { ChatListItem as default };
