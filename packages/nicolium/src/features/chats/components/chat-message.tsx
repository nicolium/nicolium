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
        className={clsx('⁂-chat-message__media', {
          '⁂-chat-message__media--with-content': content && !isMyMessage,
          '⁂-chat-message__media--my-message': isMyMessage && content,
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
        '⁂-chat-message__container--pending': chatMessage.pending,
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
              className={clsx('⁂-chat-message__menu-button', {
                '⁂-chat-message__menu-button--open': isMenuOpen,
              })}
              data-testid='chat-message-menu'
            >
              <Icon src={iconDotsThree} />
            </button>
          </DropdownMenu>
        )}
      </div>

      <div className='⁂-chat-message'>
        <div className='⁂-chat-message__content'>
          {maybeRenderMedia(chatMessage)}

          {content && (
            <div className='⁂-chat-message__bubble__container'>
              <div
                title={getFormattedTimestamp(chatMessage)}
                className={clsx({
                  '⁂-chat-message__bubble': true,
                  '⁂-chat-message__bubble--with-attachment': !!chatMessage.attachment,
                  '⁂-chat-message__bubble--my-message': isMyMessage,
                  '⁂-chat-message__bubble--emoji': isOnlyEmoji,
                })}
                ref={setBubbleRef}
                tabIndex={0}
              >
                <div className='⁂-chat-message__text'>
                  <ParsedContent html={content} emojis={chatMessage.emojis} />
                </div>
              </div>
            </div>
          )}
        </div>

        <span className='⁂-chat-message__details'>{intl.formatTime(chatMessage.created_at)}</span>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export { ChatMessage as default };
