import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { create } from 'mutative';
import { useMemo } from 'react';

import { importEntities } from '@/actions/importer';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { store } from '@/store';
import { compareDate } from '@/utils/comparators';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import {
  minifyConversation,
  minifyConversationList,
  type MinifiedConversation,
} from '../utils/minify-list';
import { updatePaginatedResponse } from '../utils/update-paginated-response';

import type { Conversation, PaginatedResponse } from 'pl-api';

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

const updateConversations = (conversation: Conversation) => {
  importConversationEntities([conversation]);

  queryClient.setQueryData(queryKeys.conversations.all, (data) => {
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
    queryKey: queryKeys.conversations.all,
    queryFn: async ({ pageParam }) => {
      if (pageParam.next) {
        return pageParam.next();
      }

      const response = await client.timelines.getConversations();
      return minifyConversationList(response);
    },
    initialPageParam: {
      next: null as (() => Promise<PaginatedResponse<MinifiedConversation>>) | null,
    } as PaginatedResponse<MinifiedConversation>,
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
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.all });

      const previous = queryClient.getQueryData(queryKeys.conversations.all);

      updatePaginatedResponse<MinifiedConversation>(queryKeys.conversations.all, (items) =>
        items.map((item) => (item.id === conversationId ? { ...item, unread: false } : item)),
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.conversations.all, context.previous);
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
