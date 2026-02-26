import * as v from 'valibot';

import { chatMessageSchema, chatSchema } from '../entities';

import type { PlApiBaseClient } from '../client-base';
import type {
  CreateChatMessageParams,
  GetChatMessagesParams,
  GetChatsParams,
} from '../params/chats';

/** @see {@link https://docs.pleroma.social/backend/development/API/chats} */
const chats = (client: PlApiBaseClient) => ({
  /**
   * create or get an existing Chat for a certain recipient
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#creating-or-getting-a-chat}
   */
  createChat: async (accountId: string) => {
    const response = await client.request(`/api/v1/pleroma/chats/by-account-id/${accountId}`, {
      method: 'POST',
    });

    return v.parse(chatSchema, response.json);
  },

  /**
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#creating-or-getting-a-chat}
   */
  getChat: async (chatId: string) => {
    const response = await client.request(`/api/v1/pleroma/chats/${chatId}`);

    return v.parse(chatSchema, response.json);
  },

  /**
   * Marking a chat as read
   * mark a number of messages in a chat up to a certain message as read
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#marking-a-chat-as-read}
   */
  markChatAsRead: async (chatId: string, last_read_id: string) => {
    const response = await client.request(`/api/v1/pleroma/chats/${chatId}/read`, {
      method: 'POST',
      body: { last_read_id },
    });

    return v.parse(chatSchema, response.json);
  },

  /**
   * Marking a single chat message as read
   * To set the `unread` property of a message to `false`
   * https://docs.pleroma.social/backend/development/API/chats/#marking-a-single-chat-message-as-read
   */
  markChatMessageAsRead: async (chatId: string, chatMessageId: string) => {
    const response = await client.request(
      `/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}/read`,
      { method: 'POST' },
    );

    return v.parse(chatSchema, response.json);
  },

  /**
   * Getting a list of Chats
   * This will return a list of chats that you have been involved in, sorted by their last update (so new chats will be at the top).
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-a-list-of-chats}
   */
  getChats: (params?: GetChatsParams) =>
    client.paginatedGet('/api/v2/pleroma/chats', { params }, chatSchema),

  /**
   * Getting the messages for a Chat
   * For a given Chat id, you can get the associated messages with
   */
  getChatMessages: (chatId: string, params?: GetChatMessagesParams) =>
    client.paginatedGet(`/api/v1/pleroma/chats/${chatId}/messages`, { params }, chatMessageSchema),

  /**
   * Posting a chat message
   * Posting a chat message for given Chat id works like this:
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#posting-a-chat-message}
   */
  createChatMessage: async (chatId: string, params: CreateChatMessageParams) => {
    const response = await client.request(`/api/v1/pleroma/chats/${chatId}/messages`, {
      method: 'POST',
      body: params,
    });

    return v.parse(chatMessageSchema, response.json);
  },

  /**
   * Deleting a chat message
   * Deleting a chat message for given Chat id works like this:
   * @see {@link https://docs.pleroma.social/backend/development/API/chats/#deleting-a-chat-message}
   */
  deleteChatMessage: async (chatId: string, messageId: string) => {
    const response = await client.request(`/api/v1/pleroma/chats/${chatId}/messages/${messageId}`, {
      method: 'DELETE',
    });

    return v.parse(chatMessageSchema, response.json);
  },

  /**
   * Deleting a chat
   *
   * Requires features{@link Features.chatsDelete}.
   */
  deleteChat: async (chatId: string) => {
    const response = await client.request(`/api/v1/pleroma/chats/${chatId}`, { method: 'DELETE' });

    return v.parse(chatSchema, response.json);
  },
});

export { chats };
