import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { Account } from 'pl-api';

interface IBitePopover {
  biteControls: Account['bite_controls'];
}

const BitePopover: React.FC<IBitePopover> = ({ biteControls }) => (
  <div className='interaction-popover'>
    <p className='interaction-popover__header'>
      <FormattedMessage
        id='account.bite_controls.header'
        defaultMessage='You can’t bite this user.'
      />
    </p>
    <p className='interaction-popover__description'>
      {biteControls === 'none' ? (
        <FormattedMessage
          id='account.bite_controls.none'
          defaultMessage='This user does not allow bites.'
        />
      ) : (
        <FormattedMessage
          id='account.bite_controls.followers'
          defaultMessage='Only followers can bite this user.'
        />
      )}
    </p>
  </div>
);

export { BitePopover };
