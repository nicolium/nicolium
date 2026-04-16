import React from 'react';

import QuotedStatus from '@/components/statuses/quoted-status';
import { useStatus } from '@/queries/statuses/use-status';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
  /** The depth of quote nesting. */
  quoteDepth?: number;
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId, quoteDepth }) => {
  const { data: status } = useStatus(statusId, { withFilteredResults: true });

  if (!status) {
    return null;
  }

  return <QuotedStatus status={status} quoteDepth={quoteDepth} />;
};

export { QuotedStatusContainer as default };
