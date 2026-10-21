import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { compareDate } from '@/utils/comparators';

import { queryKeys } from '../keys';
import { useAppInfiniteQuery, scopedQueryKey } from '../query';
import { minifyConversationList, type MinifiedConversation } from '../utils/minify-list';
import { updatePaginatedResponse } from '../utils/update-paginated-response';

import type { PaginatedResponse } from 'pl-api';

const sortConversations = (items: MinifiedConversation[]) =>
  items.toSorted((a, b) => {
    if (a.last_status_created_at === null || b.last_status_created_at === null) {
      return -1;
    }

    return compareDate(a.last_status_created_at, b.last_status_created_at);
  });

const useConversations = () => {
  const client = useClient();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  const query = useAppInfiniteQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: async ({ pageParam }) => {
      if (pageParam.next) {
        return pageParam.next();
      }

      const response = await client.timelines.getConversations();
      return minifyConversationList(response, scopeUrl);
    },
    initialPageParam: {
      next: null as (() => Promise<PaginatedResponse<MinifiedConversation>>) | null,
    } as PaginatedResponse<MinifiedConversation>,
    getNextPageParam: (page) => (page.next ? page : undefined),
    enabled: features.conversations,
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
  const scopeUrl = useScopeUrl();
  const conversationsKey = scopedQueryKey(queryKeys.conversations.all, scopeUrl);

  return useMutation({
    mutationKey: ['conversations', conversationId, 'read'],
    mutationFn: () => client.timelines.markConversationRead(conversationId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: conversationsKey });

      const previous = queryClient.getQueryData(conversationsKey);

      updatePaginatedResponse(conversationsKey, (items) =>
        items.map((item) => (item.id === conversationId ? { ...item, unread: false } : item)),
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(conversationsKey, context.previous);
      }
    },
  });
};

export { useConversations, useMarkConversationRead };
