import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useDirectStream } from '@/api/hooks/streaming/use-direct-stream';
import Column from '@/components/ui/column';
import ConversationsList from '@/features/conversations/components/conversations-list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
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
