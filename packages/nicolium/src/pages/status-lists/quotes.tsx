import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { QuotesList } from '@/columns/status-interactions';
import Column from '@/components/ui/column';
import { statusQuotesRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const QuotesPage: React.FC = () => {
  const intl = useIntl();
  const { statusId } = statusQuotesRoute.useParams();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <QuotesList statusId={statusId} />
    </Column>
  );
};

export { QuotesPage as default };
