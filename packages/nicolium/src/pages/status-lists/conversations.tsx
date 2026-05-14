import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import { useDirectStream } from '@/hooks/streaming/use-direct-stream';
import ConversationsList from '@/pages/status-lists/components/conversations-list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search.placeholder', defaultMessage: 'Send a message to…' },
});

const ConversationsTimeline = () => {
  const intl = useIntl();

  useDirectStream();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <ConversationsList />
    </Column>
  );
};

export { ConversationsTimeline as default };
