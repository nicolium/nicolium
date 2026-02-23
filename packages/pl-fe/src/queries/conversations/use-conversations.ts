import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { create } from 'mutative';
import { useMemo } from 'react';

import { importEntities } from '@/actions/importer';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { store } from '@/store';
import { compareDate } from '@/utils/comparators';

import { queryClient } from '../client';
import { updatePaginatedResponse } from '../utils/update-paginated-response';

import type { Conversation, PaginatedResponse } from 'pl-api';

type MinifiedConversation = {
  id: string;
  unread: boolean;
  account_ids: string[];
  last_status: string | null;
  last_status_created_at: string | null;
};

type MinifiedConversationPage = PaginatedResponse<MinifiedConversation>;

const minifyConversation = (conversation: Conversation): MinifiedConversation => ({
  id: conversation.id,
  unread: conversation.unread,
  account_ids: conversation.accounts.map((account) => account.id),
  last_status: conversation.last_status?.id ?? null,
  last_status_created_at: conversation.last_status?.created_at ?? null,
});

const sortConversations = (items: MinifiedConversation[]) =>
  items.toSorted((a, b) => {
    if (a.last_status_created_at === null || b.last_status_created_at === null) {
      return -1;
    }

    return compareDate(a.last_status_created_at, b.last_status_created_at);
  });

const importConversationEntities = (conversations: Conversation[]) => {
  store.dispatch(
    importEntities({
      accounts: conversations.flatMap((conversation) => conversation.accounts),
      statuses: conversations.map((conversation) => conversation.last_status),
    }) as any,
  );
};

const minifyConversationPage = (
  response: PaginatedResponse<Conversation>,
): MinifiedConversationPage => {
  importConversationEntities(response.items);

  return {
    ...response,
    previous: response.previous
      ? () => response.previous!().then((page) => minifyConversationPage(page))
      : null,
    next: response.next
      ? () => response.next!().then((page) => minifyConversationPage(page))
      : null,
    items: response.items.map(minifyConversation),
  };
};

const updateConversations = (conversation: Conversation) => {
  importConversationEntities([conversation]);

  queryClient.setQueryData<InfiniteData<MinifiedConversationPage>>(['conversations'], (data) => {
    if (!data || !data.pages.length) return data;

    return create(data, (draft) => {
      const updatedConversation = minifyConversation(conversation);

      let found = false;

      for (const page of draft.pages) {
        const index = page.items.findIndex((item) => item.id === updatedConversation.id);
        if (index !== -1) {
          page.items[index] = updatedConversation;
          found = true;
          break;
        }
      }

      if (!found) {
        draft.pages[0].items.unshift(updatedConversation);
      }
    });
  });
};

const useConversations = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const query = useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam }) => {
      if (pageParam.next) {
        return pageParam.next();
      }

      const response = await client.timelines.getConversations();
      return minifyConversationPage(response);
    },
    initialPageParam: {
      previous: null,
      next: null,
      items: [],
      partial: false,
    } as MinifiedConversationPage,
    getNextPageParam: (page) => (page.next ? page : undefined),
    enabled: isLoggedIn,
  });

  const conversations = useMemo(
    () => sortConversations(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  );

  return { ...query, conversations };
};

const useMarkConversationRead = (conversationId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['conversations', conversationId, 'read'],
    mutationFn: () => client.timelines.markConversationRead(conversationId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      const previous = queryClient.getQueryData<InfiniteData<MinifiedConversationPage>>([
        'conversations',
      ]);

      updatePaginatedResponse<MinifiedConversation>(['conversations'], (items) =>
        items.map((item) => (item.id === conversationId ? { ...item, unread: false } : item)),
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations'], context.previous);
      }
    },
  });
};

export {
  useConversations,
  useMarkConversationRead,
  updateConversations,
  type MinifiedConversation,
};
