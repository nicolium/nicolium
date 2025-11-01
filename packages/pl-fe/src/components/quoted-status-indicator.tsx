import React, { useCallback } from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatus } from 'pl-fe/selectors';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId?: string;
  /** The quoted status URL. */
  statusUrl?: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId, statusUrl }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  statusUrl = useAppSelector(state => statusUrl || statusId && getStatus(state, { id: statusId })?.url);

  if (!statusUrl) return null;

  return (
    <HStack alignItems='center' space={1}>
      <Icon className='size-5' src={require('@phosphor-icons/core/regular/quotes.svg')} aria-hidden />
      <Text truncate>{statusUrl}</Text>
    </HStack>
  );
};

export { QuotedStatusIndicator as default };
