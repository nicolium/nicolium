import React, { useCallback } from 'react';

import { cancelQuoteCompose } from '@/actions/compose';
import QuotedStatus from '@/components/quoted-status';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: state.compose[composeId]?.quoteId! }));

  const onCancel = () => {
    dispatch(cancelQuoteCompose(composeId));
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus
        status={status}
        onCancel={onCancel}
        compose
      />
    </div>
  );
};

export { QuotedStatusContainer as default };
