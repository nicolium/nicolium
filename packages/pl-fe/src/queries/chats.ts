import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';
import {
  type Chat,
  type ChatMessage as BaseChatMessage,
  type PaginatedResponse,
  chatMessageSchema,
} from 'pl-api';
import * as v from 'valibot';

import { batcher } from '@/api/batcher';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useStatContext } from '@/contexts/stat-context';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useOwnAccount } from '@/hooks/use-own-account';
import { type ChatMessage, normalizeChatMessage } from '@/normalizers/chat-message';
import { reOrderChatListItems } from '@/utils/chats';
import { flattenPages, updatePageItem } from '@/utils/queries';

import { useRelationshipQuery } from './accounts/use-relationship';
import { queryClient } from './client';
import { queryKeys } from './keys';

const useChatMessages = (chat: Chat) => {
  const client = useClient();
  const isBlocked = !!useRelationshipQuery(chat?.account.id).data?.blocked_by;

  const getChatMessages = async (
    chatId: string,
    pageParam?: Pick<PaginatedResponse<BaseChatMessage>, 'next'>,
  ) => {
    const response = await (pageParam?.next
      ? pageParam.next()
      : client.chats.getChatMessages(chatId));

    return {
      ...response,
      items: response.items.map(normalizeChatMessage),
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: queryKeys.chats.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseChatMessage>>) | null },
    getNextPageParam: (config) => (config.next ? config : undefined),
  });

  const data = flattenPages<ChatMessage>(queryInfo.data as any)?.toReversed();

  return {
    ...queryInfo,
    data,
  };
};

const useChats = () => {
  const client = useClient();
  const features = useFeatures();
  const { setUnreadChatsCount } = useStatContext();
  const { me } = useLoggedIn();

  const getChats = async (
    pageParam?: Pick<PaginatedResponse<Chat>, 'next'>,
  ): Promise<PaginatedResponse<Chat>> => {
    const response = await (pageParam?.next ?? client.chats.getChats)();
    const { items } = response;

    setUnreadChatsCount(sumBy(data, (chat) => chat.unread));

    // Fetch account relationships
    const fetcher = batcher.relationships(client).fetch;
    for (const { account } of items) {
      fetcher(account.id);
      queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
    }

    return response;
  };

  const queryInfo = useInfiniteQuery({
    queryKey: queryKeys.chats.search,
    queryFn: ({ pageParam }) => getChats(pageParam),
    placeholderData: keepPreviousData,
    enabled: features.chats && !!me,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<Chat>>) | null },
    getNextPageParam: (config) => (config.next ? config : undefined),
  });

  const data = flattenPages(queryInfo.data);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId: string) => client.chats.createChat(accountId);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  const getChat = async () => {
    if (chatId) {
      const data = await client.chats.getChat(chatId);

      queryClient.setQueryData(queryKeys.accounts.show(data.account.id), data.account);

      return data;
    }
  };

  return useQuery<Chat | undefined>({
    queryKey: queryKeys.chats.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
    enabled: !!chatId,
  });
};

const useMarkChatAsRead = (chatId: string) => {
  const client = useClient();

  const { setUnreadChatsCount } = useStatContext();

  return useMutation({
    mutationFn: (lastReadId: string) => client.chats.markChatAsRead(chatId, lastReadId),
    onSuccess: (data) => {
      updatePageItem(queryKeys.chats.search, data, (o, n) => o.id === n.id);
      const queryData = queryClient.getQueryData(queryKeys.chats.search);

      if (queryData) {
        const flattenedQueryData: any = flattenPages(queryData)?.map((chat: any) => {
          if (chat.id === data.id) {
            return data;
          }
          return chat;
        });
        setUnreadChatsCount(sumBy(flattenedQueryData, (chat: Chat) => chat.unread));
      }
    },
  });
};

const useCreateChatMessage = (chatId: string) => {
  const { data: account } = useOwnAccount();
  const client = useClient();

  const { chat } = useChatContext();

  return useMutation({
    mutationFn: ({
      chatId,
      content,
      mediaId,
    }: {
      chatId: string;
      content: string;
      mediaId?: string;
    }) => client.chats.createChatMessage(chatId, { content, media_id: mediaId }),
    retry: false,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKeys.chats.chatMessages(variables.chatId),
      });

      // Snapshot the previous value
      const prevContent = variables.content;
      const prevChatMessages = queryClient.getQueryData(
        queryKeys.chats.chatMessages(variables.chatId),
      );
      const pendingId = String(Date.now());

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.chats.chatMessages(variables.chatId), (prevResult) => {
        if (!prevResult?.pages) return prevResult;
        const newResult = { ...prevResult };
        newResult.pages = newResult.pages.map((page, idx: number) => {
          if (idx === 0) {
            return {
              ...page,
              items: [
                normalizeChatMessage({
                  ...v.parse(chatMessageSchema, {
                    chat_id: variables.chatId,
                    content: variables.content,
                    id: pendingId,
                    created_at: new Date().toISOString(),
                    account_id: account?.id,
                    unread: true,
                  }),
                  pending: true,
                }),
                ...page.items,
              ],
            };
          }

          return page;
        });

        return newResult;
      });

      return { prevChatMessages, prevContent, pendingId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, variables, context) => {
      if (context) {
        queryClient.setQueryData(
          queryKeys.chats.chatMessages(variables.chatId),
          context.prevChatMessages,
        );
      }
    },
    onSuccess: (response: any, variables, context) => {
      const nextChat = { ...chat, last_message: response };
      updatePageItem(queryKeys.chats.search, nextChat, (o, n) => o.id === n.id);
      updatePageItem(
        queryKeys.chats.chatMessages(variables.chatId),
        normalizeChatMessage(response),
        (o) => o.id === context.pendingId,
      );
      reOrderChatListItems();
    },
  });
};

const useDeleteChat = (chatId: string) => {
  const client = useClient();

  const { changeScreen } = useChatContext();

  return useMutation({
    mutationFn: () => client.chats.deleteChat(chatId),
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.search });
    },
  });
};

const useDeleteChatMessage = (chatId: string) => {
  const client = useClient();

  return useMutation({
    mutationFn: (chatMessageId: string) => client.chats.deleteChatMessage(chatId, chatMessageId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.chatMessages(chatId),
      });
    },
  });
};

export {
  useChat,
  useMarkChatAsRead,
  useCreateChatMessage,
  useDeleteChat,
  useDeleteChatMessage,
  useChats,
  useChatMessages,
};
