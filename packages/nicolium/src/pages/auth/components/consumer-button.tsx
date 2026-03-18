import iconFacebookLogo from '@phosphor-icons/core/regular/facebook-logo.svg';
import iconGithubLogo from '@phosphor-icons/core/regular/github-logo.svg';
import iconGoogleLogo from '@phosphor-icons/core/regular/google-logo.svg';
import iconKey from '@phosphor-icons/core/regular/key.svg';
import iconSlackLogo from '@phosphor-icons/core/regular/slack-logo.svg';
import iconSquaresFour from '@phosphor-icons/core/regular/squares-four.svg';
import iconTwitterLogo from '@phosphor-icons/core/regular/twitter-logo.svg';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { prepareRequest } from '@/actions/consumer-auth';
import IconButton from '@/components/ui/icon-button';
import Tooltip from '@/components/ui/tooltip';
import { capitalize } from '@/utils/strings';

const messages = defineMessages({
  tooltip: { id: 'oauth_consumer.tooltip', defaultMessage: 'Sign in with {provider}' },
});

/** Map between OAuth providers and brand icons. */
const BRAND_ICONS: Record<string, string> = {
  twitter: iconTwitterLogo,
  facebook: iconFacebookLogo,
  google: iconGoogleLogo,
  microsoft: iconSquaresFour,
  slack: iconSlackLogo,
  github: iconGithubLogo,
};

interface IConsumerButton {
  provider: string;
}

/** OAuth consumer button for logging in with a third-party service. */
const ConsumerButton: React.FC<IConsumerButton> = ({ provider }) => {
  const intl = useIntl();

  const icon = BRAND_ICONS[provider] || iconKey;

  const handleClick = () => {
    prepareRequest(provider);
  };

  return (
    <Tooltip text={intl.formatMessage(messages.tooltip, { provider: capitalize(provider) })}>
      <IconButton
        theme='outlined'
        className='p-2.5'
        iconClassName='h-6 w-6'
        src={icon}
        onClick={handleClick}
        title={intl.formatMessage(messages.tooltip, { provider: capitalize(provider) })}
      />
    </Tooltip>
  );
};

export { ConsumerButton as default };
