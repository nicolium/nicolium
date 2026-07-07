import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useEmailDomainBlocksQuery = makePaginatedResponseQuery(
  () => queryKeys.admin.emailDomainBlocks,
  (client) => client.admin.emailDomainBlocks.getEmailDomainBlocks(),
  undefined,
  'isAdmin',
);

const useCreateEmailDomainBlockMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (domain: string) => client.admin.emailDomainBlocks.createEmailDomainBlock(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.emailDomainBlocks, scopeUrl),
      });
    },
  });
};

const useDeleteEmailDomainBlockMutation = (emailDomainBlockId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: () => client.admin.emailDomainBlocks.deleteEmailDomainBlock(emailDomainBlockId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.emailDomainBlocks, scopeUrl),
      });
    },
  });
};

export {
  useEmailDomainBlocksQuery,
  useCreateEmailDomainBlockMutation,
  useDeleteEmailDomainBlockMutation,
};
