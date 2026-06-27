import sumBy from 'lodash/sumBy';

import { normalizeChatMessage } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';

import { compareDate } from './comparators';
import { appendPageItem, flattenPages, sortQueryData, updatePageItem } from './queries';

import type { Chat } from 'pl-api';

/**
 * Update the Chat entity inside the ChatSearch query.
 * @param newChat - Chat entity.
 */
const updateChatInChatSearchQuery = (newChat: Chat) => {
  updatePageItem<Chat>(queryKeys.chats.search, newChat, (o, n) => o.id === n.id);
};

/**
 * Re-order the ChatSearch query by the last message timestamp.
 */
const reorderChatListItems = (scopeUrl: string) => {
  sortQueryData(scopedQueryKey(queryKeys.chats.search, scopeUrl), (chatA, chatB) =>
    compareDate(chatA.last_message?.created_at as string, chatB.last_message?.created_at as string),
  );
};

/**
 * Check if a Chat entity exists within the cached ChatSearch query.
 * @param chatId - String
 * @returns Boolean
 */
const checkIfChatExists = (chatId: string, scopeUrl: string) => {
  const currentChats = flattenPages(
    queryClient.getQueryData(scopedQueryKey(queryKeys.chats.search, scopeUrl)),
  );

  return currentChats?.find((chat: Chat) => chat.id === chatId);
};

/**
 * Force a re-fetch of ChatSearch.
 */
const invalidateChatSearchQuery = (scopeUrl: string) => {
  queryClient.invalidateQueries({
    queryKey: scopedQueryKey(queryKeys.chats.search, scopeUrl),
  });
};

const updateChatListItem = (newChat: Chat, scopeUrl: string) => {
  const { id: chatId, last_message: lastMessage } = newChat;

  const isChatAlreadyLoaded = checkIfChatExists(chatId, scopeUrl);

  if (isChatAlreadyLoaded) {
    // If the chat exists in the client, let's update it.
    updateChatInChatSearchQuery(newChat);
    // Now that we have the new chat loaded, let's re-sort to put
    // the most recent on top.
    reorderChatListItems(scopeUrl);
  } else {
    // If this is a brand-new chat, let's invalid the queries.
    invalidateChatSearchQuery(scopeUrl);
  }

  if (lastMessage) {
    // Update the Chat Messages query data.
    appendPageItem(
      scopedQueryKey(queryKeys.chats.chatMessages(newChat.id), scopeUrl),
      normalizeChatMessage(lastMessage),
    );
  }
};

/** Get unread chats count. */
const getUnreadChatsCount = (scopeUrl: string): number => {
  const chats = flattenPages(
    queryClient.getQueryData(scopedQueryKey(queryKeys.chats.search, scopeUrl)),
  );

  return sumBy(chats, (chat) => chat.unread);
};

export { updateChatListItem, getUnreadChatsCount, reorderChatListItems };
