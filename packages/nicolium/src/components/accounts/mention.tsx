import React from 'react';

import Tooltip from '@/components/ui/tooltip';

import { AccountLink } from './account-link';

import type { Mention as MentionEntity } from 'pl-api';

interface IMention {
  mention: MentionEntity;
  disabled?: boolean;
}

/** Mention for display in the composer. */
const Mention: React.FC<IMention> = ({ mention, disabled }) => {
  const handleClick: React.MouseEventHandler = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Tooltip text={`@${mention.acct}`}>
      <AccountLink account={mention} onClick={handleClick} dir='ltr'>
        @{mention.username}
      </AccountLink>
    </Tooltip>
  );
};

export { Mention as default };
