import { useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';

import type { NormalizedStatus } from '@/normalizers/status';
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
  const me = useCurrentAccount();

  return useMemo(() => {
    if (type === 'can_quote') {
      const quoteApproval = status.quote_approval;

      return {
        canInteract: !quoteApproval || quoteApproval.current_user !== 'denied',
        approvalRequired: quoteApproval?.current_user === 'manual',
      };
    }
    const interactionPolicy = status.interaction_policy;

    if (me === status.account_id || interactionPolicy[type].automatic_approval.includes('me'))
      return {
        canInteract: true,
        approvalRequired: false,
      };

    if (interactionPolicy[type].manual_approval.includes('me'))
      return {
        canInteract: true,
        approvalRequired: true,
      };

    return {
      canInteract: false,
      approvalRequired: null,
      allowed: [
        ...interactionPolicy[type].automatic_approval,
        ...interactionPolicy[type].manual_approval,
      ],
    };
  }, [me, status.id, type]);
};

export { useCanInteract };
