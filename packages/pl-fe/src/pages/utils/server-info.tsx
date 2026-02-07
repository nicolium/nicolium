import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Divider from '@/components/ui/divider';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import LinkFooter from '@/features/ui/components/link-footer';
import PromoPanel from '@/features/ui/components/panels/promo-panel';
import { useInstance } from '@/hooks/use-instance';

const messages = defineMessages({
  heading: { id: 'column.info', defaultMessage: 'Server information' },
});

const ServerInfoPage = () => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <Stack>
          <Text size='lg' weight='medium'>{instance.title}</Text>
          <Text theme='muted'>{instance.description}</Text>
        </Stack>

        <Divider />

        <PromoPanel />

        <Divider />

        <LinkFooter />
      </Stack>
    </Column>
  );
};

export { ServerInfoPage as default };
