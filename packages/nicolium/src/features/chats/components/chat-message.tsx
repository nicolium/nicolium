import iconClipboard from '@phosphor-icons/core/regular/clipboard.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import clsx from 'clsx';
import escape from 'lodash/escape';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { MediaGallery } from '@/features/ui/util/async-components';
import { useDeleteChatMessage, type ChatMessage as ChatMessageEntity } from '@/queries/chats';
import { useModalsActions } from '@/stores/modals';
import { stripHTML } from '@/utils/html';
import { onlyEmoji } from '@/utils/rich-content';

import type { Menu as IMenu } from '@/components/dropdown-menu';
import type { Chat, MediaAttachment } from 'pl-api';

const messages = defineMessages({
  copy: { id: 'chats.actions.copy', defaultMessage: 'Copy' },
  delete: { id: 'chats.actions.delete', defaultMessage: 'Delete for both' },
  deleteForMe: { id: 'chats.actions.delete_for_me', defaultMessage: 'Delete for me' },
  more: { id: 'chats.actions.more', defaultMessage: 'More' },
});

const BIG_EMOJI_LIMIT = 3;

const parsePendingContent = (content: string) =>
  escape(content).replaceAll(/(?:\r\n|\r|\n)/g, '<br>');

const parseContent = (chatMessage: ChatMessageEntity) => {
  const content = chatMessage.content || '';
  const pending = chatMessage.pending;
  const deleting = chatMessage.deleting;
  const formatted = pending && !deleting ? parsePendingContent(content) : content;
  return formatted;
};

interface IChatMessage {
  chat: Chat;
  chatMessage: ChatMessageEntity;
}

const ChatMessage: React.FC<IChatMessage> = React.memo((props) => {
  const { chat, chatMessage } = props;

  const { openModal } = useModalsActions();
  const intl = useIntl();

  const me = useCurrentAccount();
  const deleteChatMessage = useDeleteChatMessage(chat.id);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const content = parseContent(chatMessage);
  const isMyMessage = chatMessage.account_id === me;

  const isOnlyEmoji = useMemo(() => {
    const hiddenEl = document.createElement('div');
    hiddenEl.innerHTML = content;
    return onlyEmoji(hiddenEl, BIG_EMOJI_LIMIT, false);
  }, []);

  const onOpenMedia = (media: Array<MediaAttachment>, index: number) => {
    openModal('MEDIA', { media, index });
  };

  const maybeRenderMedia = (chatMessage: ChatMessageEntity) => {
    if (!chatMessage.attachment) return null;

    return (
      <MediaGallery
        className={clsx({
          'rounded-br-sm': isMyMessage && content,
          'rounded-bl-sm': !isMyMessage && content,
        })}
        media={[chatMessage.attachment]}
        onOpenMedia={onOpenMedia}
        visible
      />
    );
  };

  const handleCopyText = (chatMessage: ChatMessageEntity) => {
    if (navigator.clipboard) {
      const text = stripHTML(chatMessage.content);
      navigator.clipboard.writeText(text);
    }
  };

  const setBubbleRef = (c: HTMLDivElement) => {
    if (!c) return;
    const links = c.querySelectorAll('a[rel="ugc"]');

    links.forEach((link) => {
      link.classList.add('chat-link');
      link.setAttribute('rel', 'ugc nofollow noopener');
      link.setAttribute('target', '_blank');
    });
  };

  const getFormattedTimestamp = (chatMessage: ChatMessageEntity) =>
    intl.formatDate(new Date(chatMessage.created_at), {
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const menu = useMemo(() => {
    const menu: IMenu = [];

    if (navigator.clipboard && chatMessage.content) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: () => {
          handleCopyText(chatMessage);
        },
        icon: iconClipboard,
      });
    }

    if (isMyMessage) {
      menu.push({
        text: intl.formatMessage(messages.delete),
        action: () => {
          deleteChatMessage.mutate(chatMessage.id);
        },
        icon: iconTrash,
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.deleteForMe),
        action: () => {
          deleteChatMessage.mutate(chatMessage.id);
        },
        icon: iconTrash,
        destructive: true,
      });
    }

    return menu;
  }, [chatMessage, chat]);

  return (
    <div
      className={clsx({
        '⁂-chat-message__container': true,
        '⁂-chat-message__container--menu-open': isMenuOpen,
        '⁂-chat-message__container--my-message': isMyMessage,
      })}
      data-testid='chat-message'
    >
      <div className='⁂-chat-message__actions'>
        {menu.length > 0 && (
          <DropdownMenu
            items={menu}
            onOpen={() => {
              setIsMenuOpen(true);
            }}
            onClose={() => {
              setIsMenuOpen(false);
            }}
          >
            <button
              title={intl.formatMessage(messages.more)}
              className={clsx({
                'rounded-md p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-700 focus:text-gray-700 focus:ring-0 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-500 dark:focus:text-gray-500': true,
                '!text-gray-700 dark:!text-gray-500': isMenuOpen,
              })}
              data-testid='chat-message-menu'
            >
              <Icon src={iconDotsThree} className='size-4' />
            </button>
          </DropdownMenu>
        )}
      </div>

      <div className='⁂-chat-message'>
        <div
          className={clsx('flex items-center', {
            'justify-end': isMyMessage,
            'justify-start': !isMyMessage,
            'opacity-50': chatMessage.pending,
          })}
        >
          <div
            className={clsx({
              'flex max-w-[85%] flex-col gap-0.5': true,
              'flex-1': !!chatMessage.attachment,
              'order-3 items-end': isMyMessage,
              'order-1 items-start': !isMyMessage,
            })}
          >
            {maybeRenderMedia(chatMessage)}

            {content && (
              <div className='flex max-w-full items-end'>
                <div
                  title={getFormattedTimestamp(chatMessage)}
                  className={clsx({
                    'relative max-w-full space-y-2 text-ellipsis break-words rounded-md px-3 py-2 [&_.mention]:underline': true,
                    'rounded-tr-sm': !!chatMessage.attachment && isMyMessage,
                    'rounded-tl-sm': !!chatMessage.attachment && !isMyMessage,
                    '[&_.mention]:text-primary-600 dark:[&_.mention]:text-primary-400':
                      !isMyMessage,
                    'dark:[&_.mention]:white [&_.mention]:text-white': isMyMessage,
                    'bg-primary-500 text-white': isMyMessage,
                    'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100': !isMyMessage,
                    'emoji-lg !bg-transparent !p-0': isOnlyEmoji,
                  })}
                  ref={setBubbleRef}
                  tabIndex={0}
                >
                  <Text size='sm' theme='inherit' className='break-word-nested'>
                    <ParsedContent html={content} emojis={chatMessage.emojis} />
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <span className='⁂-chat-message__details'>{intl.formatTime(chatMessage.created_at)}</span>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export { ChatMessage as default };
