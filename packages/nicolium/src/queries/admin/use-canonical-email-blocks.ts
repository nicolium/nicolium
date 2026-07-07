import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useCanonicalEmailBlocksQuery = makePaginatedResponseQuery(
  () => queryKeys.admin.canonicalEmailBlocks,
  (client) => client.admin.canonicalEmailBlocks.getCanonicalEmailBlocks(),
  undefined,
  'isAdmin',
);

const useCreateCanonicalEmailBlockMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (email: string) =>
      client.admin.canonicalEmailBlocks.createCanonicalEmailBlock(email),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.canonicalEmailBlocks, scopeUrl),
      });
    },
  });
};

const useTestCanonicalEmailBlockMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (email: string) => client.admin.canonicalEmailBlocks.testCanonicalEmailBlock(email),
  });
};

const useDeleteCanonicalEmailBlockMutation = (canonicalEmailBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: () =>
      client.admin.canonicalEmailBlocks.deleteCanonicalEmailBlock(canonicalEmailBlockId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.canonicalEmailBlocks, scopeUrl),
      });
    },
  });
};

export {
  useCanonicalEmailBlocksQuery,
  useCreateCanonicalEmailBlockMutation,
  useTestCanonicalEmailBlockMutation,
  useDeleteCanonicalEmailBlockMutation,
};
