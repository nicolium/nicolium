import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { AdminRule } from 'pl-api';

interface CreateRuleParams {
  priority?: number;
  text: string;
  hint?: string;
}

interface UpdateRuleParams {
  id: string;
  priority?: number;
  text?: string;
  hint?: string;
}

const useRules = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const getRules = () => client.admin.rules.getRules();

  const result = useAppQuery<ReadonlyArray<AdminRule>>({
    queryKey: queryKeys.admin.rules,
    queryFn: getRules,
    placeholderData: [],
  });

  const { mutate: createRule, isPending: isCreating } = useMutation({
    mutationFn: (params: CreateRuleParams) => client.admin.rules.createRule(params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.rules, scopeUrl), (prevResult) =>
        prevResult ? [...prevResult, data] : undefined,
      ),
  });

  const { mutate: updateRule, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, ...params }: UpdateRuleParams) => client.admin.rules.updateRule(id, params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.rules, scopeUrl), (prevResult) =>
        prevResult?.map((rule) => (rule.id === data.id ? data : rule)),
      ),
  });

  const { mutate: deleteRule, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => client.admin.rules.deleteRule(id),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.rules, scopeUrl), (prevResult) =>
        prevResult?.filter(({ id: ruleId }) => ruleId !== id),
      ),
  });

  return {
    ...result,
    createRule,
    isCreating,
    updateRule,
    isUpdating,
    deleteRule,
    isDeleting,
  };
};

export { useRules };
