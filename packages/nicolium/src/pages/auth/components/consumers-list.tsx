import React from 'react';
import { FormattedMessage } from 'react-intl';

import Card from '@/components/ui/card';
import { useInstance } from '@/stores/instance';

import ConsumerButton from './consumer-button';

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC = () => {
  const instance = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='consumers-list'>
        <p>
          <FormattedMessage id='oauth_consumers.title' defaultMessage='Other ways to sign in' />
        </p>
        <div className='consumers-list__providers'>
          {providers.map((provider) => (
            <ConsumerButton key={provider} provider={provider} />
          ))}
        </div>
      </Card>
    );
  } else {
    return null;
  }
};

export { ConsumersList as default };
