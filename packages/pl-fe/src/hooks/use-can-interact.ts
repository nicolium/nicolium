import { useMemo } from 'react';

import { useAppSelector } from './use-app-selector';

import type { NormalizedStatus } from '@/reducers/statuses';
import type { InteractionPolicy, InteractionPolicyEntry } from 'pl-api';

const useCanInteract = (
  status: Pick<
    NormalizedStatus,
    'account_id' | 'id' | 'interaction_policy' | 'mentions' | 'quote_approval'
  >,
  type: keyof InteractionPolicy | 'can_quote',
): {
  canInteract: boolean;
  approvalRequired: boolean | null;
  allowed?: Array<InteractionPolicyEntry>;
} => {
  const me = useAppSelector((state) => state.me);

  return useMemo(() => {
    if (type === 'can_quote') {
      const quoteApproval = status.quote_approval;

      return {
        canInteract: !quoteApproval || quoteApproval.current_user !== 'denied',
        approvalRequired: quoteApproval?.current_user === 'manual',
      };
    }
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
