import clsx from 'clsx';
import escape from 'lodash/escape';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import { ParsedContent } from '@/components/parsed-content';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { MediaGallery } from '@/features/ui/util/async-components';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useDeleteChatMessage } from '@/queries/chats';
import { useModalsActions } from '@/stores/modals';
import { stripHTML } from '@/utils/html';
import { onlyEmoji } from '@/utils/rich-content';

import type { Menu as IMenu } from '@/components/dropdown-menu';
import type { ChatMessage as ChatMessageEntity } from '@/normalizers/chat-message';
import type { Chat } from 'pl-api';

const messages = defineMessages({
  copy: { id: 'chats.actions.copy', defaultMessage: 'Copy' },
  delete: { id: 'chats.actions.delete', defaultMessage: 'Delete for both' },
  deleteForMe: { id: 'chats.actions.delete_for_me', defaultMessage: 'Delete for me' },
  more: { id: 'chats.actions.more', defaultMessage: 'More' },
});

const BIG_EMOJI_LIMIT = 3;

const parsePendingContent = (content: string) => escape(content).replace(/(?:\r\n|\r|\n)/g, '<br>');

const parseContent = (chatMessage: ChatMessageEntity) => {
  const content = chatMessage.content || '';
  const pending = chatMessage.pending;
  const deleting = chatMessage.deleting;
  const formatted = (pending && !deleting) ? parsePendingContent(content) : content;
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

  const me = useAppSelector((state) => state.me);
  const deleteChatMessage = useDeleteChatMessage(chat.id);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const content = parseContent(chatMessage);
  const isMyMessage = chatMessage.account_id === me;

  const isOnlyEmoji = useMemo(() => {
    const hiddenEl = document.createElement('div');
    hiddenEl.innerHTML = content;
    return onlyEmoji(hiddenEl, BIG_EMOJI_LIMIT, false);
  }, []);

  const onOpenMedia = (media: any, index: number) => {
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

    links.forEach(link => {
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
        action: () => handleCopyText(chatMessage),
        icon: require('@phosphor-icons/core/regular/clipboard.svg'),
      });
    }

    if (isMyMessage) {
      menu.push({
        text: intl.formatMessage(messages.delete),
        action: () => deleteChatMessage.mutate(chatMessage.id),
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.deleteForMe),
        action: () => deleteChatMessage.mutate(chatMessage.id),
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
      });
    }

    return menu;
  }, [chatMessage, chat]);

  return (
    <div
      className={
        clsx({
          'group relative px-4 py-2 hover:bg-gray-200/40 dark:hover:bg-gray-800/40': true,
          'bg-gray-200/40 dark:bg-gray-800/40': isMenuOpen,
        })
      }
      data-testid='chat-message'
    >
      <div
        className={
          clsx({
            'p-1 flex items-center space-x-0.5 z-10 absolute opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 rounded-md shadow-lg bg-white dark:bg-gray-900 dark:ring-2 dark:ring-primary-700': true,
            'top-2 right-2': !isMyMessage,
            'top-2 left-2': isMyMessage,
            '!opacity-100': isMenuOpen,
          })
        }
      >

        {menu.length > 0 && (
          <DropdownMenu
            items={menu}
            onOpen={() => setIsMenuOpen(true)}
            onClose={() => setIsMenuOpen(false)}
          >
            <button
              title={intl.formatMessage(messages.more)}
              className={clsx({
                'p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-500 focus:text-gray-700 dark:focus:text-gray-500 focus:ring-0': true,
                '!text-gray-700 dark:!text-gray-500': isMenuOpen,
              })}
              data-testid='chat-message-menu'
            >
              <Icon
                src={require('@phosphor-icons/core/regular/dots-three.svg')}
                className='size-4'
              />
            </button>
          </DropdownMenu>
        )}
      </div>

      <Stack
        space={1.5}
        className={clsx({
          'ml-auto': isMyMessage,
        })}
      >
        <HStack
          alignItems='center'
          justifyContent={isMyMessage ? 'end' : 'start'}
          className={clsx({
            'opacity-50': chatMessage.pending,
          })}
        >
          <Stack
            space={0.5}
            className={clsx({
              'max-w-[85%]': true,
              'flex-1': !!chatMessage.attachment,
              'order-3': isMyMessage,
              'order-1': !isMyMessage,
            })}
            alignItems={isMyMessage ? 'end' : 'start'}
          >
            {maybeRenderMedia(chatMessage)}

            {content && (
              <HStack alignItems='bottom' className='max-w-full'>
                <div
                  title={getFormattedTimestamp(chatMessage)}
                  className={
                    clsx({
                      'text-ellipsis break-words relative rounded-md py-2 px-3 max-w-full space-y-2 [&_.mention]:underline': true,
                      'rounded-tr-sm': (!!chatMessage.attachment) && isMyMessage,
                      'rounded-tl-sm': (!!chatMessage.attachment) && !isMyMessage,
                      '[&_.mention]:text-primary-600 dark:[&_.mention]:text-primary-400': !isMyMessage,
                      '[&_.mention]:text-white dark:[&_.mention]:white': isMyMessage,
                      'bg-primary-500 text-white': isMyMessage,
                      'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100': !isMyMessage,
                      '!bg-transparent !p-0 emoji-lg': isOnlyEmoji,
                    })
                  }
                  ref={setBubbleRef}
                  tabIndex={0}
                >
                  <Text size='sm' theme='inherit' className='break-word-nested'>
                    <ParsedContent html={content} emojis={chatMessage.emojis} />
                  </Text>
                </div>
              </HStack>
            )}
          </Stack>
        </HStack>

        <HStack
          alignItems='center'
          space={2}
          className={clsx({
            'ml-auto': isMyMessage,
          })}
        >
          <div
            className={clsx({
              'text-right': isMyMessage,
              'order-2': !isMyMessage,
            })}
          >
            <span className='flex items-center space-x-1.5'>
              <Text theme='muted' size='xs'>
                {intl.formatTime(chatMessage.created_at)}
              </Text>
            </span>
          </div>
        </HStack>
      </Stack>
    </div>
  );
});

export { ChatMessage as default };
