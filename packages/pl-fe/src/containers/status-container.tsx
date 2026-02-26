import React, { useMemo } from 'react';

import Status, { type IStatus } from '@/components/status';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string;
  contextType?: string;
  /** @deprecated Unused. */
  otherAccounts?: any;
}

/**
 * Legacy Status wrapper accepting a status ID instead of the full entity.
 * @deprecated Use the Status component directly.
 */
const StatusContainer: React.FC<IStatusContainer> = (props) => {
  const { id, contextType } = props;

  const getStatus = useMemo(makeGetStatus, []);
  const status = useAppSelector((state) => getStatus(state, { id, contextType }));

  if (status) {
    return <Status {...props} status={status} />;
  } else {
    return null;
  }
};

export { StatusContainer as default };
