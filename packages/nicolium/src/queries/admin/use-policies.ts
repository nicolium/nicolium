import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey, useAppQuery } from '../query';

const usePolicies = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useAppQuery({
    queryKey: queryKeys.admin.policies.root,
    queryFn: () => client.admin.policies.getPolicies(),
    enabled: ownAccount?.is_admin && features.iceshrimpAdmin,
  });
};

const usePolicy = (policyName: string) => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useAppQuery({
    queryKey: queryKeys.admin.policies.one(policyName),
    queryFn: () => client.admin.policies.getPolicy(policyName),
    enabled: ownAccount?.is_admin && features.iceshrimpAdmin,
  });
};

const useSetPolicy = (policyName: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: Record<string, unknown>) =>
      client.admin.policies.setPolicy(policyName, params),
    retry: false,
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.policies.one(policyName), scopeUrl),
      });
    },
  });
};

export { usePolicies, usePolicy, useSetPolicy };
