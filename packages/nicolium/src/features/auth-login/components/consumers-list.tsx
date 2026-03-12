import React from 'react';
import { FormattedMessage } from 'react-intl';

import Card from '@/components/ui/card';
import Text from '@/components/ui/text';
import { useInstance } from '@/hooks/use-instance';

import ConsumerButton from './consumer-button';

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC = () => {
  const instance = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='bg-gray-50 p-2 black:bg-black black:p-0 dark:bg-primary-800 sm:rounded-xl'>
        <div className='flex flex-col gap-2'>
          <Text size='xs' theme='muted'>
            <FormattedMessage id='oauth_consumers.title' defaultMessage='Other ways to sign in' />
          </Text>
          <div className='flex gap-2'>
            {providers.map((provider) => (
              <ConsumerButton key={provider} provider={provider} />
            ))}
          </div>
        </div>
      </Card>
    );
  } else {
    return null;
  }
};

export { ConsumersList as default };
