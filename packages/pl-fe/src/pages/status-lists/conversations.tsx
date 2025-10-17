import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { mountConversations, unmountConversations, expandConversations } from 'pl-fe/actions/conversations';
import { useDirectStream } from 'pl-fe/api/hooks/streaming/use-direct-stream';
import Column from 'pl-fe/components/ui/column';
import ConversationsList from 'pl-fe/features/conversations/components/conversations-list';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
});

const ConversationsTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useDirectStream();

  useEffect(() => {
    dispatch(mountConversations());
    dispatch(expandConversations(false));

    return () => {
      dispatch(unmountConversations());
    };
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <ConversationsList />
    </Column>
  );
};

export { ConversationsTimeline as default };
