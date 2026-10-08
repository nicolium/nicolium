import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import {
  useCredentialAccount,
  useCredentialAccountId,
} from '@/queries/accounts/use-account-credentials';

import type { NormalizedStatus } from '@/queries/statuses/normalize';
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
  const { data: currentAccountId } = useCredentialAccountId();

  return useMemo(() => {
    if (type === 'can_quote') {
      const quoteApproval = status.quote_approval;

      return {
        canInteract: !quoteApproval || quoteApproval.current_user !== 'denied',
        approvalRequired: quoteApproval?.current_user === 'manual',
      };
    }
    const interactionPolicy = status.interaction_policy;

    if (
      currentAccountId === status.account_id ||
      interactionPolicy[type].automatic_approval.includes('me')
    )
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
  }, [currentAccountId, status.id, type]);
};

const INTERACTION_POLICY_HEADERS = {
  can_favourite: {
    id: 'status.interaction_policy.favourite.header',
    defaultMessage: 'The author limits who can like this post.',
  },
  can_reblog: {
    id: 'status.interaction_policy.reblog.header',
    defaultMessage: 'The author limits who can repost this post.',
  },
  can_reply: {
    id: 'status.interaction_policy.reply.header',
    defaultMessage: 'The author limits who can reply to this post.',
  },
  can_quote: {
    id: 'status.interaction_policy.quote.header',
    defaultMessage: 'The author limits who can quote this post.',
  },
};

const INTERACTION_POLICY_DESCRIPTIONS = {
  can_favourite: {
    followers: {
      id: 'status.interaction_policy.favourite.followers_only',
      defaultMessage: 'Only users following the author can like.',
    },
    following: {
      id: 'status.interaction_policy.favourite.following_only',
      defaultMessage: 'Only users followed by the author can like.',
    },
    mutuals: {
      id: 'status.interaction_policy.favourite.mutuals_only',
      defaultMessage: 'Only users mutually following the author can like.',
    },
    mentioned: {
      id: 'status.interaction_policy.favourite.mentioned_only',
      defaultMessage: 'Only users mentioned by the author can like.',
    },
  },
  can_reblog: {
    followers: {
      id: 'status.interaction_policy.reblog.followers_only',
      defaultMessage: 'Only users following the author can repost.',
    },
    following: {
      id: 'status.interaction_policy.reblog.following_only',
      defaultMessage: 'Only users followed by the author can repost.',
    },
    mutuals: {
      id: 'status.interaction_policy.reblog.mutuals_only',
      defaultMessage: 'Only users mutually following the author can repost.',
    },
    mentioned: {
      id: 'status.interaction_policy.reblog.mentioned_only',
      defaultMessage: 'Only users mentioned by the author can repost.',
    },
  },
  can_reply: {
    followers: {
      id: 'status.interaction_policy.reply.followers_only',
      defaultMessage: 'Only users following the author can reply.',
    },
    following: {
      id: 'status.interaction_policy.reply.following_only',
      defaultMessage: 'Only users followed by the author can reply.',
    },
    mutuals: {
      id: 'status.interaction_policy.reply.mutuals_only',
      defaultMessage: 'Only users mutually following the author can reply.',
    },
    mentioned: {
      id: 'status.interaction_policy.reply.mentioned_only',
      defaultMessage: 'Only users mentioned by the author can reply.',
    },
  },
  can_quote: {
    followers: {
      id: 'status.interaction_policy.quote.followers_only',
      defaultMessage: 'Only users following the author can quote.',
    },
    following: {
      id: 'status.interaction_policy.quote.following_only',
      defaultMessage: 'Only users followed by the author can quote.',
    },
    mutuals: {
      id: 'status.interaction_policy.quote.mutuals_only',
      defaultMessage: 'Only users mutually following the author can quote.',
    },
    mentioned: {
      id: 'status.interaction_policy.quote.mentioned_only',
      defaultMessage: 'Only users mentioned by the author can quote.',
    },
  },
};

const useInteractionMessages = (
  status: Pick<
    NormalizedStatus,
    'account_id' | 'id' | 'interaction_policy' | 'mentions' | 'quote_approval'
  >,
  type: keyof InteractionPolicy | 'can_quote',
) => {
  const intl = useIntl();
  const { canInteract, allowed } = useCanInteract(status, type);

  if (canInteract) return null;

  const allowedType = allowed?.includes('followers')
    ? 'followers'
    : allowed?.includes('following')
      ? 'following'
      : allowed?.includes('mutuals')
        ? 'mutuals'
        : 'mentioned';

  return {
    title: intl.formatMessage(INTERACTION_POLICY_HEADERS[type]),
    content: intl.formatMessage(INTERACTION_POLICY_DESCRIPTIONS[type][allowedType]),
  };
};

export { useCanInteract, useInteractionMessages };
