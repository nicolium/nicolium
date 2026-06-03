import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column_forbidden.title', defaultMessage: 'Forbidden' },
});

const ColumnForbidden = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='column-forbidden'>
        <FormattedMessage
          id='column_forbidden.body'
          defaultMessage='You do not have permission to access this page.'
        />
      </div>
    </Column>
  );
};

export { ColumnForbidden as default };
