import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { KINKY } from '@/build-config';
import List, { ListItem } from '@/components/list';
import MissingIndicator from '@/components/missing-indicator';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';

const messages = defineMessages({
  heading: { id: 'preferences.heading.integrations', defaultMessage: 'Integrations' },
});

const IntegrationsPreferences: React.FC = () => {
  const intl = useIntl();

  if (!KINKY) return <MissingIndicator />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='column.integrations.openshock'
                defaultMessage='OpenShock integration'
              />
            }
            to='/settings/integrations/openshock'
          />
        </List>
      </Form>
    </Column>
  );
};

export { IntegrationsPreferences as default };
