import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Text from '@/components/ui/text';
import Widget from '@/components/ui/widget';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';

import SiteWallet from './site-wallet';

const messages = defineMessages({
  actionTitle: {
    id: 'crypto_donate_panel.actions.view',
    defaultMessage: 'Click to see {count, plural, one {# wallet} other {# wallets}}',
  },
});

interface ICryptoDonatePanel {
  limit: number;
}

const CryptoDonatePanel: React.FC<ICryptoDonatePanel> = ({
  limit = 3,
}): React.JSX.Element | null => {
  const intl = useIntl();
  const navigate = useNavigate();
  const instance = useInstance();

  const addresses = useFrontendConfig().cryptoAddresses;

  if (limit === 0 || addresses.length === 0) {
    return null;
  }

  const handleAction = () => {
    navigate({ to: '/donate/crypto' });
  };

  return (
    <Widget
      title={
        <FormattedMessage id='crypto_donate_panel.heading' defaultMessage='Donate cryptocurrency' />
      }
      onActionClick={handleAction}
      actionTitle={intl.formatMessage(messages.actionTitle, { count: addresses.length })}
    >
      <Text>
        <FormattedMessage
          id='crypto_donate_panel.intro.message'
          defaultMessage='{siteTitle} accepts cryptocurrency donations to fund our service. Thank you for your support!'
          values={{ siteTitle: instance.title }}
        />
      </Text>

      <SiteWallet limit={limit} />
    </Widget>
  );
};

export { CryptoDonatePanel as default };
