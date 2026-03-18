import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { WrenchedTimelineColumn } from '@/columns/timeline';
import { TimelinePicker } from '@/components/timeline-picker';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
});

const WrenchedTimelinePage = () => {
  const intl = useIntl();

  return (
    <Column
      className='-mt-3 sm:mt-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='wrenched' />}
      truncateTitle={false}
    >
      <WrenchedTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.wrenched'
            defaultMessage='There is nothing here! 🔧 a public post to fill it up'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/wrench.svg')}
      />
    </Column>
  );
};

export { WrenchedTimelinePage as default };
