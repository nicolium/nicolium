import React from 'react';
import { FormattedMessage } from 'react-intl';

import QuotedStatus from '@/components/statuses/quoted-status';
import { useStatus } from '@/queries/statuses/use-status';
import { useCompose, useComposeActions } from '@/stores/compose';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const { quoteId, sourceQuoteId } = useCompose(composeId);

  const { data: status } = useStatus(quoteId ?? undefined);

  const onCancel = () => {
    updateCompose(composeId, (draft) => {
      if (draft.quoteId) draft.dismissedQuotes.push(draft.quoteId);
      draft.quoteId = null;
    });
  };

  if (quoteId === null && sourceQuoteId && !status) {
    return (
      <div className='quoted-status quoted-status--compose'>
        <p className='quoted-status__filtered'>
          <FormattedMessage
            id='compose.reply.unresolved'
            defaultMessage='The referenced post could not be resolved.'
          />
        </p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return <QuotedStatus status={status} onCancel={onCancel} compose />;
};

export { QuotedStatusContainer as default };
