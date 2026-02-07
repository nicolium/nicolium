import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { prepareRequest } from '@/actions/consumer-auth';
import IconButton from '@/components/ui/icon-button';
import Tooltip from '@/components/ui/tooltip';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { capitalize } from '@/utils/strings';

const messages = defineMessages({
  tooltip: { id: 'oauth_consumer.tooltip', defaultMessage: 'Sign in with {provider}' },
});

/** Map between OAuth providers and brand icons. */
const BRAND_ICONS: Record<string, string> = {
  twitter: require('@phosphor-icons/core/regular/twitter-logo.svg'),
  facebook: require('@phosphor-icons/core/regular/facebook-logo.svg'),
  google: require('@phosphor-icons/core/regular/google-logo.svg'),
  microsoft: require('@phosphor-icons/core/regular/squares-four.svg'),
  slack: require('@phosphor-icons/core/regular/slack-logo.svg'),
  github: require('@phosphor-icons/core/regular/github-logo.svg'),
};

interface IConsumerButton {
  provider: string;
}

/** OAuth consumer button for logging in with a third-party service. */
const ConsumerButton: React.FC<IConsumerButton> = ({ provider }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const icon = BRAND_ICONS[provider] || require('@phosphor-icons/core/regular/key.svg');

  const handleClick = () => {
    dispatch(prepareRequest(provider));
  };

  return (
    <Tooltip text={intl.formatMessage(messages.tooltip, { provider: capitalize(provider) })}>
      <IconButton
        theme='outlined'
        className='p-2.5'
        iconClassName='h-6 w-6'
        src={icon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export { ConsumerButton as default };
