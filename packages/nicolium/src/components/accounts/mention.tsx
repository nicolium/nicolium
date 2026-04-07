import React from 'react';

import Tooltip from '@/components/ui/tooltip';

import { AccountLink } from './account-link';

import type { Mention as MentionEntity } from 'pl-api';

interface IMention {
  mention: MentionEntity;
  disabled?: boolean;
}

/** Mention for display in the composer. */
const Mention: React.FC<IMention> = ({ mention: { acct, username }, disabled }) => {
  const handleClick: React.MouseEventHandler = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Tooltip text={`@${acct}`}>
      <AccountLink account={{ acct, username }} onClick={handleClick} dir='ltr'>
        @{username}
      </AccountLink>
    </Tooltip>
  );
};

export { Mention as default };
