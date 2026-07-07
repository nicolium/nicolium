import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

import type { AdminCreateIpBlockParams, AdminUpdateIpBlockParams } from 'pl-api';

const useIpBlocksQuery = makePaginatedResponseQuery(
  () => queryKeys.admin.ipBlocks,
  (client) => client.admin.ipBlocks.getIpBlocks(),
  undefined,
  'isAdmin',
);

const useCreateIpBlockMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: AdminCreateIpBlockParams) => client.admin.ipBlocks.createIpBlock(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.ipBlocks, scopeUrl),
      });
    },
  });
};

const useUpdateIpBlockMutation = (ipBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: AdminUpdateIpBlockParams) =>
      client.admin.ipBlocks.updateIpBlock(ipBlockId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.ipBlocks, scopeUrl),
      });
    },
  });
};

const useDeleteIpBlockMutation = (ipBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: () => client.admin.ipBlocks.deleteIpBlock(ipBlockId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.ipBlocks, scopeUrl),
      });
    },
  });
};

export {
  useIpBlocksQuery,
  useCreateIpBlockMutation,
  useUpdateIpBlockMutation,
  useDeleteIpBlockMutation,
};
