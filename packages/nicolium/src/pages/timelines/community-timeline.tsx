import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { PublicTimelineColumn } from '@/columns/timeline';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

const CommunityTimelinePage = () => {
  const intl = useIntl();

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)}>
      <PublicTimelineColumn
        local
        emptyMessageText={
          <FormattedMessage
            id='empty_column.community'
            defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { CommunityTimelinePage as default };
