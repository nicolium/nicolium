import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import React from 'react';

import Icon from '@/components/ui/icon';
import { useMinimalStatus } from '@/queries/statuses/use-status';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId?: string;
  /** The quoted status URL. */
  statusUrl?: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId, statusUrl }) => {
  statusUrl = useMinimalStatus(statusId).data?.url || statusUrl;

  if (!statusUrl) return null;

  return (
    <div className='⁂-quoted-status-indicator'>
      <Icon src={iconQuotes} aria-hidden />
      <p>{statusUrl}</p>
    </div>
  );
};

export { QuotedStatusIndicator as default };
