import React, { useState, useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Accordion from '@/components/ui/accordion';
import Column from '@/components/ui/column';
import RestrictedInstance from '@/features/federation-restrictions/components/restricted-instance';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useInstance } from '@/hooks/use-instance';
import { makeGetHosts } from '@/selectors';
import { federationRestrictionsDisclosed } from '@/utils/state';

const messages = defineMessages({
  heading: { id: 'column.federation_restrictions', defaultMessage: 'Federation restrictions' },
  boxTitle: { id: 'federation_restrictions.explanation_box.title', defaultMessage: 'Instance-specific policies' },
  boxMessage: { id: 'federation_restrictions.explanation_box.message', defaultMessage: 'Normally servers on the Fediverse can communicate freely. {siteTitle} has imposed restrictions on the following servers.' },
});

const FederationRestrictionsPage = () => {
  const intl = useIntl();
  const instance = useInstance();

  const getHosts = useCallback(makeGetHosts(), []);

  const hosts = useAppSelector((state) => getHosts(state));
  const disclosed = useAppSelector((state) => federationRestrictionsDisclosed(state));

  const [explanationBoxExpanded, setExplanationBoxExpanded] = useState(true);

  const toggleExplanationBox = (setting: boolean) => {
    setExplanationBoxExpanded(setting);
  };

  const emptyMessage = disclosed
    ? <FormattedMessage id='federation_restrictions.empty_message' defaultMessage='{siteTitle} has not restricted any instances.' values={{ siteTitle: instance.title }} />
    : <FormattedMessage id='federation_restrictions.not_disclosed_message' defaultMessage='{siteTitle} does not disclose federation restrictions through the API.' values={{ siteTitle: instance.title }} />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Accordion
        headline={intl.formatMessage(messages.boxTitle)}
        expanded={explanationBoxExpanded}
        onToggle={toggleExplanationBox}
      >
        {intl.formatMessage(messages.boxMessage, { siteTitle: instance.title })}
      </Accordion>

      <div className='pt-4'>
        <ScrollableList emptyMessageText={emptyMessage}>
          {hosts.map(([host]) => <RestrictedInstance key={host} host={host} />)}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { FederationRestrictionsPage as default };
