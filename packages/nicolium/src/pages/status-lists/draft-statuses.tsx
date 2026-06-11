import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DraftStatusesColumn from '@/columns/draft-statuses';
import Column from '@/components/ui/column';

const messages = defineMessages({
  heading: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
});

const DraftStatusesPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <DraftStatusesColumn />
    </Column>
  );
};

export { DraftStatusesPage as default };
