import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';
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

  return useMutation({
    mutationFn: ({ domain, ...params }: { domain: string } & AdminCreateDomainBlockParams) =>
      client.admin.domainBlocks.createDomainBlock(domain, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.domainBlocks });
    },
  });
};

const useUpdateDomainBlockMutation = (domainBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AdminUpdateDomainBlockParams) =>
      client.admin.domainBlocks.updateDomainBlock(domainBlockId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.domainBlocks });
    },
  });
};

const useDeleteDomainBlockMutation = (domainBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.admin.domainBlocks.deleteDomainBlock(domainBlockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.domainBlocks });
    },
  });
};

export {
  useDomainBlocksQuery,
  useCreateDomainBlockMutation,
  useUpdateDomainBlockMutation,
  useDeleteDomainBlockMutation,
};
