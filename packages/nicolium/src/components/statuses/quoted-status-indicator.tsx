import React from 'react';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
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
    <div className='flex items-center gap-1'>
      <Icon
        className='size-5'
        src={require('@phosphor-icons/core/regular/quotes.svg')}
        aria-hidden
      />
      <Text truncate>{statusUrl}</Text>
    </div>
  );
};

export { QuotedStatusIndicator as default };
