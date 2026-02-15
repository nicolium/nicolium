import React, { useCallback } from 'react';

import QuotedStatus from '@/components/quoted-status';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) => getStatus(state, { id: statusId }));

  if (!status) {
    return null;
  }

  return <QuotedStatus status={status} />;
};

export { QuotedStatusContainer as default };
