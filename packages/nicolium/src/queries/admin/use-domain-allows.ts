import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useDomainAllowsQuery = makePaginatedResponseQuery(
  () => queryKeys.admin.domainAllows,
  (client) => client.admin.domainAllows.getDomainAllows(),
  undefined,
  'isAdmin',
);

const useCreateDomainAllowMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (domain: string) => client.admin.domainAllows.createDomainAllow(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.domainAllows, scopeUrl),
      });
    },
  });
};

const useDeleteDomainAllowMutation = (domainAllowId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: () => client.admin.domainAllows.deleteDomainAllow(domainAllowId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.domainAllows, scopeUrl),
      });
    },
  });
};

export { useDomainAllowsQuery, useCreateDomainAllowMutation, useDeleteDomainAllowMutation };
