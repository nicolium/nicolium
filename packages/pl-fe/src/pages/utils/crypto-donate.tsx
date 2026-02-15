import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Accordion from '@/components/ui/accordion';
import Column from '@/components/ui/column';
import Stack from '@/components/ui/stack';
import SiteWallet from '@/features/crypto-donate/components/site-wallet';
import { useInstance } from '@/hooks/use-instance';

const messages = defineMessages({
  heading: { id: 'column.crypto_donate', defaultMessage: 'Donate cryptocurrency' },
});

const CryptoDonatePage: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const instance = useInstance();

  const [explanationBoxExpanded, toggleExplanationBox] = useState(true);

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader>
      <Stack space={5}>
        <Accordion
          headline={
            <FormattedMessage
              id='crypto_donate.explanation_box.title'
              defaultMessage='Sending cryptocurrency donations'
            />
          }
          expanded={explanationBoxExpanded}
          onToggle={toggleExplanationBox}
        >
          <FormattedMessage
            id='crypto_donate.explanation_box.message'
            defaultMessage='{siteTitle} accepts cryptocurrency donations. You may send a donation to any of the addresses below. Thank you for your support!'
            values={{ siteTitle: instance.title }}
          />
        </Accordion>

        <SiteWallet />
      </Stack>
    </Column>
  );
};

export { CryptoDonatePage as default };
