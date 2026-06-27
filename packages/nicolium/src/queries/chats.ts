import { keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';
import {
  type Chat,
  type ChatMessage as BaseChatMessage,
  PaginatedResponse,
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
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppInfiniteQuery, useAppQuery } from '@/queries/query';
import { reorderChatListItems } from '@/utils/chats';
import { flattenPages, updatePageItem } from '@/utils/queries';

import { useRelationshipQuery } from './accounts/use-relationship';
import { queryClient } from './client';
import { queryKeys } from './keys';

const normalizeChatMessage = (
  chatMessage: BaseChatMessage & { pending?: boolean; deleting?: boolean },
) => ({
  type: 'message' as const,
  pending: false,
  deleting: false,
  ...chatMessage,
});

type ChatMessage = ReturnType<typeof normalizeChatMessage>;

const normalizeChatMessagesList = ({
  previous,
  next,
  items,
  ...response
}: PaginatedResponse<BaseChatMessage>): PaginatedResponse<ChatMessage> =>
  new PaginatedResponse(items.map(normalizeChatMessage), {
    ...response,
    previous: previous ? () => previous().then((res) => normalizeChatMessagesList(res)) : null,
    next: next ? () => next().then((res) => normalizeChatMessagesList(res)) : null,
  });

const useChatMessages = (chat: Chat) => {
  const client = useClient();
  const isBlocked = !!useRelationshipQuery(chat?.account.id).data?.blocked_by;

  const getChatMessages = async (
    chatId: string,
    pageParam?: Pick<PaginatedResponse<ChatMessage>, 'next'>,
  ) => {
    if (pageParam?.next) return pageParam.next();

    return normalizeChatMessagesList(await client.chats.getChatMessages(chatId));
  };

  const queryInfo = useAppInfiniteQuery({
    queryKey: queryKeys.chats.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<ChatMessage>>) | null },
    getNextPageParam: (config) => (config.next ? config : undefined),
  });

  const data = flattenPages<ChatMessage>(queryInfo.data)?.toReversed();

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
  const scopeUrl = useScopeUrl();

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
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
        account,
      );
    }

    return response;
  };

  const queryInfo = useAppInfiniteQuery({
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
  const scopeUrl = useScopeUrl();

  const getChat = async () => {
    if (chatId) {
      const data = await client.chats.getChat(chatId);

      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(data.account.id), scopeUrl),
        data.account,
      );

      return data;
    }
  };

  return useAppQuery<Chat | undefined>({
    queryKey: queryKeys.chats.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
    enabled: !!chatId,
  });
};

const useMarkChatAsRead = (chatId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const { setUnreadChatsCount } = useStatContext();

  return useMutation({
    mutationFn: (lastReadId: string) => client.chats.markChatAsRead(chatId, lastReadId),
    onSuccess: (data) => {
      updatePageItem(
        scopedQueryKey(queryKeys.chats.search, scopeUrl),
        data,
        (o, n) => o.id === n.id,
      );
      const queryData = queryClient.getQueryData(scopedQueryKey(queryKeys.chats.search, scopeUrl));

      if (queryData) {
        const flattenedQueryData: any = flattenPages(queryData)?.map((chat) => {
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

const useCreateChatMessage = () => {
  const { data: account } = useOwnAccount();
  const client = useClient();
  const scopeUrl = useScopeUrl();

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
        scopedQueryKey(queryKeys.chats.chatMessages(variables.chatId), scopeUrl),
      );
      const pendingId = String(Date.now());

      // Optimistically update to the new value
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.chats.chatMessages(variables.chatId), scopeUrl),
        (prevResult) => {
          if (!prevResult?.pages) return prevResult;
          const newResult = { ...prevResult };
          const [firstPage, ...restPages] = newResult.pages;
          newResult.pages = [
            new PaginatedResponse(
              [
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
                ...firstPage.items,
              ],
              firstPage,
            ),
            ...restPages,
          ];

          return newResult;
        },
      );

      return { prevChatMessages, prevContent, pendingId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, variables, context) => {
      if (context) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.chats.chatMessages(variables.chatId), scopeUrl),
          context.prevChatMessages,
        );
      }
    },
    onSuccess: (response, variables, context) => {
      const nextChat = { ...chat, last_message: response };
      updatePageItem(
        scopedQueryKey(queryKeys.chats.search, scopeUrl),
        nextChat,
        (o, n) => o.id === n.id,
      );
      updatePageItem(
        scopedQueryKey(queryKeys.chats.chatMessages(variables.chatId), scopeUrl),
        normalizeChatMessage(response),
        (o) => o.id === context.pendingId,
      );
      reorderChatListItems(scopeUrl);
    },
  });
};

const useDeleteChat = (chatId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const { changeScreen } = useChatContext();

  return useMutation({
    mutationFn: () => client.chats.deleteChat(chatId),
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.chats.chatMessages(chatId), scopeUrl),
      });
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.chats.search, scopeUrl) });
    },
  });
};

const useDeleteChatMessage = (chatId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (chatMessageId: string) => client.chats.deleteChatMessage(chatId, chatMessageId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.chats.chatMessages(chatId), scopeUrl),
      });
    },
  });
};

export {
  normalizeChatMessage,
  useChat,
  useMarkChatAsRead,
  useCreateChatMessage,
  useDeleteChat,
  useDeleteChatMessage,
  useChats,
  useChatMessages,
  type ChatMessage,
};
