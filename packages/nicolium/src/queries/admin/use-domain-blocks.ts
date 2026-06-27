import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

import type { AdminCreateDomainBlockParams, AdminUpdateDomainBlockParams } from 'pl-api';

const useDomainBlocksQuery = makePaginatedResponseQuery(
  () => queryKeys.admin.domainBlocks,
  (client) => client.admin.domainBlocks.getDomainBlocks(),
  undefined,
  'isAdmin',
);

const useCreateDomainBlockMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: ({ domain, ...params }: { domain: string } & AdminCreateDomainBlockParams) =>
      client.admin.domainBlocks.createDomainBlock(domain, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.domainBlocks, scopeUrl),
      });
    },
  });
};

const useUpdateDomainBlockMutation = (domainBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: AdminUpdateDomainBlockParams) =>
      client.admin.domainBlocks.updateDomainBlock(domainBlockId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.domainBlocks, scopeUrl),
      });
    },
  });
};

const useDeleteDomainBlockMutation = (domainBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: () => client.admin.domainBlocks.deleteDomainBlock(domainBlockId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.domainBlocks, scopeUrl),
      });
    },
  });
};

export {
  useDomainBlocksQuery,
  useCreateDomainBlockMutation,
  useUpdateDomainBlockMutation,
  useDeleteDomainBlockMutation,
};
