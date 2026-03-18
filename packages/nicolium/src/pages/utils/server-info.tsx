import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import PromoPanel from '@/components/panels/promo-panel';
import Column from '@/components/ui/column';
import Divider from '@/components/ui/divider';
import Text from '@/components/ui/text';
import LinkFooter from '@/features/ui/components/link-footer';
import { useInstance } from '@/stores/instance';

const messages = defineMessages({
  heading: { id: 'column.info', defaultMessage: 'Server information' },
});

const ServerInfoPage = () => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col'>
          <Text size='lg' weight='medium'>
            {instance.title}
          </Text>
          <Text theme='muted'>{instance.description}</Text>
        </div>

        <Divider />

        <PromoPanel />

        <Divider />

        <LinkFooter />
      </div>
    </Column>
  );
};

export { ServerInfoPage as default };
