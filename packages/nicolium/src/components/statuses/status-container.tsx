import React from 'react';

import Status, { type IStatus } from '@/components/statuses/status';
import { useStatus } from '@/queries/statuses/use-status';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string;
  /** @deprecated Unused. */
  otherAccounts?: any;
}

/**
 * Legacy Status wrapper accepting a status ID instead of the full entity.
 * @deprecated Use the Status component directly.
 */
const StatusContainer: React.FC<IStatusContainer> = (props) => {
  const { id } = props;

  const { data: status } = useStatus(id, { withFilteredResults: true });

  if (status) {
    return <Status {...props} status={status} />;
  } else {
    return null;
  }
};

export { StatusContainer as default };
