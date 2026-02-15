import { useMemo } from 'react';

import { useAppSelector } from './use-app-selector';

import type { MinifiedStatus } from '@/reducers/statuses';
import type { InteractionPolicy, InteractionPolicyEntry } from 'pl-api';

const useCanInteract = (
  status: Pick<MinifiedStatus, 'account_id' | 'id' | 'interaction_policy' | 'mentions'>,
  type: keyof InteractionPolicy,
): {
  canInteract: boolean;
  approvalRequired: boolean | null;
  allowed?: Array<InteractionPolicyEntry>;
} => {
  const me = useAppSelector((state) => state.me);

  return useMemo(() => {
    const interactionPolicy = status.interaction_policy;

    if (me === status.account_id || interactionPolicy[type].always.includes('me'))
      return {
        canInteract: true,
        approvalRequired: false,
      };

    if (interactionPolicy[type].with_approval.includes('me'))
      return {
        canInteract: true,
        approvalRequired: true,
      };

    return {
      canInteract: false,
      approvalRequired: null,
      allowed: [...interactionPolicy[type].always, ...interactionPolicy[type].with_approval],
    };
  }, [me, status.id, type]);
};

export { useCanInteract };
