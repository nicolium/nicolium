import { useMutation, useQuery } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';
import * as v from 'valibot';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryClient } from '@/queries/client';

import { queryKeys } from '../keys';

const emptySchema = v.parse(interactionPoliciesSchema, {});

const useInteractionPolicies = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();

  const { data, ...result } = useQuery({
    queryKey: queryKeys.interactionPolicies.all,
    queryFn: client.settings.getInteractionPolicies,
    placeholderData: emptySchema,
    enabled: isLoggedIn && features.interactionRequests,
  });

  const { mutate: updateInteractionPolicies, isPending: isUpdating } = useMutation({
    mutationFn: (policy: InteractionPolicies) => client.settings.updateInteractionPolicies(policy),
    retry: false,
    onSuccess: (policy) => {
      queryClient.setQueryData(queryKeys.interactionPolicies.all, policy);
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
