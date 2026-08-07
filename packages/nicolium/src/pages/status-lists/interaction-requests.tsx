import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { InteractionRequestsColumn } from '@/columns/interaction-requests';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column.interaction_requests', defaultMessage: 'Interaction requests' },
});

const InteractionRequestsPage: React.FC = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <InteractionRequestsColumn />
    </Column>
  );
};

export { InteractionRequestsPage as default };
