import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { AdminDomain } from 'pl-api';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

interface UpdateDomainParams {
  id: string;
  public: boolean;
}

const useDomains = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const getDomains = () => client.admin.domains.getDomains();

  const result = useAppQuery<ReadonlyArray<AdminDomain>>({
    queryKey: queryKeys.admin.domains,
    queryFn: getDomains,
    placeholderData: [],
  });

  const { mutate: createDomain, isPending: isCreating } = useMutation({
    mutationFn: (params: CreateDomainParams) => client.admin.domains.createDomain(params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.domains, scopeUrl), (prevResult) =>
        prevResult ? [...prevResult, data] : undefined,
      ),
  });

  const { mutate: updateDomain, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, ...params }: UpdateDomainParams) =>
      client.admin.domains.updateDomain(id, params.public),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.domains, scopeUrl), (prevResult) =>
        prevResult?.map((domain) => (domain.id === data.id ? data : domain)),
      ),
  });

  const { mutate: deleteDomain, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => client.admin.domains.deleteDomain(id),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.domains, scopeUrl), (prevResult) =>
        prevResult?.filter(({ id: domainId }) => domainId !== id),
      ),
  });

  return {
    ...result,
    createDomain,
    isCreating,
    updateDomain,
    isUpdating,
    deleteDomain,
    isDeleting,
  };
};

export { useDomains };
