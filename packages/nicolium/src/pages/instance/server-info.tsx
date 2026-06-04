import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import LinkFooter from '@/components/navigation/link-footer';
import PromoPanel from '@/components/panels/promo-panel';
import Column from '@/components/ui/column';
import Divider from '@/components/ui/divider';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/stores/instance';

const messages = defineMessages({
  heading: { id: 'column.info', defaultMessage: 'Server information' },
});

const ServerInfoPage = () => {
  const intl = useIntl();
  const instance = useInstance();
  const { promoPanel } = useFrontendConfig();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='server-info'>
        <div className='server-info__name'>
          <p className='server-info__title'>{instance.title}</p>
          <p className='server-info__description'>{instance.description}</p>
        </div>

        <Divider />

        <PromoPanel />

        {promoPanel.items.length > 0 && <Divider />}

        <LinkFooter />
      </div>
    </Column>
  );
};

export { ServerInfoPage as default };
