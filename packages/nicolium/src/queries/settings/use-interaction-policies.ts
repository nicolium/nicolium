import { useMutation } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';
import * as v from 'valibot';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const emptySchema = v.parse(interactionPoliciesSchema, {});

const useInteractionPolicies = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  const { data, ...result } = useAppQuery({
    queryKey: queryKeys.interactionPolicies.all,
    queryFn: client.settings.getInteractionPolicies,
    placeholderData: emptySchema,
    enabled: isLoggedIn && features.interactionRequests,
  });

  const { mutate: updateInteractionPolicies, isPending: isUpdating } = useMutation({
    mutationFn: (policy: InteractionPolicies) => client.settings.updateInteractionPolicies(policy),
    retry: false,
    onSuccess: (policy) => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.interactionPolicies.all, scopeUrl), policy);
    },
  });

  return {
    interactionPolicies: data ?? emptySchema,
    updateInteractionPolicies,
    isUpdating,
    ...result,
  };
};

export { useInteractionPolicies };
