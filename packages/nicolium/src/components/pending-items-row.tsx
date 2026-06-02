import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import iconWarningCircle from '@phosphor-icons/core/regular/warning-circle.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';

interface IPendingItemsRow extends LinkOptions {
  /** Number of pending items. */
  count: number;
}

const PendingItemsRow: React.FC<IPendingItemsRow> = ({ count, ...props }) => (
  <Link {...props} className='pending-items-row' data-testid='pending-items-row'>
    <div className='pending-items-row__content'>
      <div className='pending-items-row__main'>
        <div className='pending-items-row__badge'>
          <Icon src={iconWarningCircle} />
        </div>

        <p className='pending-items-row__label'>
          <FormattedMessage
            id='groups.pending.count'
            defaultMessage='{number, plural, one {# pending request} other {# pending requests}}'
            values={{ number: count }}
          />
        </p>
      </div>

      <Icon src={iconCaretRight} className='pending-items-row__caret' />
    </div>
  </Link>
);

export { PendingItemsRow };
