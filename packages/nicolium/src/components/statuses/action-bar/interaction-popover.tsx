import React from 'react';
import { useIntl } from 'react-intl';

import messages from './messages';

import type { useCanInteract } from '@/hooks/use-can-interact';

interface IInteractionPopover {
  type: 'favourite' | 'reblog' | 'reply' | 'quote';
  allowed: ReturnType<typeof useCanInteract>['allowed'];
}

const INTERACTION_POLICY_HEADERS = {
  favourite: messages.favouriteInteractionPolicyHeader,
  reblog: messages.reblogInteractionPolicyHeader,
  reply: messages.replyInteractionPolicyHeader,
  quote: messages.quoteInteractionPolicyHeader,
};

const INTERACTION_POLICY_DESCRIPTIONS = {
  favourite: {
    followers: messages.favouriteInteractionPolicyFollowers,
    following: messages.favouriteInteractionPolicyFollowing,
    mutuals: messages.favouriteInteractionPolicyMutuals,
    mentioned: messages.favouriteInteractionPolicyMentioned,
  },
  reblog: {
    followers: messages.reblogInteractionPolicyFollowers,
    following: messages.reblogInteractionPolicyFollowing,
    mutuals: messages.reblogInteractionPolicyMutuals,
    mentioned: messages.reblogInteractionPolicyMentioned,
  },
  reply: {
    followers: messages.replyInteractionPolicyFollowers,
    following: messages.replyInteractionPolicyFollowing,
    mutuals: messages.replyInteractionPolicyMutuals,
    mentioned: messages.replyInteractionPolicyMentioned,
  },
  quote: {
    followers: messages.quoteInteractionPolicyFollowers,
    following: messages.quoteInteractionPolicyFollowing,
    mutuals: messages.quoteInteractionPolicyMutuals,
    mentioned: messages.quoteInteractionPolicyMentioned,
  },
};

const InteractionPopover: React.FC<IInteractionPopover> = ({ type, allowed }) => {
  const intl = useIntl();

  const allowedType = allowed?.includes('followers')
    ? 'followers'
    : allowed?.includes('following')
      ? 'following'
      : allowed?.includes('mutuals')
        ? 'mutuals'
        : 'mentioned';

  return (
    <div className='interaction-popover'>
      <p className='interaction-popover__header'>
        {intl.formatMessage(INTERACTION_POLICY_HEADERS[type])}
      </p>
      <p className='interaction-popover__description'>
        {intl.formatMessage(INTERACTION_POLICY_DESCRIPTIONS[type][allowedType])}
      </p>
    </div>
  );
};

export { InteractionPopover };
