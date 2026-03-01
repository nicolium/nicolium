import React from 'react';

import QuotedStatus from '@/components/statuses/quoted-status';
import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const { quoteId } = useCompose(composeId);

  const { data: status } = useStatus(quoteId ?? undefined);

  const onCancel = () => {
    updateCompose(composeId, (draft) => {
      if (draft.quoteId) draft.dismissedQuotes.push(draft.quoteId);
      draft.quoteId = null;
    });
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus status={status} onCancel={onCancel} compose />
    </div>
  );
};

export { QuotedStatusContainer as default };
