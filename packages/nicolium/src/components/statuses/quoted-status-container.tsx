import React from 'react';

import QuotedStatus from '@/components/statuses/quoted-status';
import { useStatus } from '@/queries/statuses/use-status';

import type { FilterContextType } from '@/queries/settings/use-filters';
import type { QuoteState } from 'pl-api';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
  /** The depth of quote nesting. */
  quoteDepth?: number;
  state: QuoteState | null;
  contextType?: FilterContextType;
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({
  statusId,
  quoteDepth,
  state,
}) => {
  const { data: status } = useStatus(statusId, { withFilteredResults: true });

  if (!status) {
    return null;
  }

  return <QuotedStatus status={status} quoteDepth={quoteDepth} state={state} />;
};

export { QuotedStatusContainer as default };
