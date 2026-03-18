import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { BubbleTimelineColumn } from '@/columns/timeline';
import { TimelinePicker } from '@/components/timeline-picker';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
});

const BubbleTimelinePage = () => {
  const intl = useIntl();

  return (
    <Column
      className='-mt-3 sm:mt-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='bubble' />}
      truncateTitle={false}
    >
      <BubbleTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.bubble'
            defaultMessage='There is nothing here! Write something publicly to fill it up'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { BubbleTimelinePage as default };
