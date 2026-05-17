import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';
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

  return useMutation({
    mutationFn: (domain: string) => client.admin.domainAllows.createDomainAllow(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.domainAllows });
    },
  });
};

const useDeleteDomainAllowMutation = (domainAllowId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.admin.domainAllows.deleteDomainAllow(domainAllowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.domainAllows });
    },
  });
};

export { useDomainAllowsQuery, useCreateDomainAllowMutation, useDeleteDomainAllowMutation };
