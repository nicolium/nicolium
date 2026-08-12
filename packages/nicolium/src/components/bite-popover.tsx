import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { Account } from 'pl-api';

interface IBitePopover {
  biteControls: Account['bite_controls'];
  status?: boolean;
}

const BitePopover: React.FC<IBitePopover> = ({ biteControls, status }) => (
  <div className='interaction-popover'>
    <p className='interaction-popover__header'>
      {status ? (
        <FormattedMessage
          id='account.bite_controls.header.status'
          defaultMessage='You can’t bite this post.'
        />
      ) : (
        <FormattedMessage
          id='account.bite_controls.header'
          defaultMessage='You can’t bite this user.'
        />
      )}
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
