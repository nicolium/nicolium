import iconCheck from '@phosphor-icons/core/regular/check.svg';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useFrontendConfig } from '@/hooks/use-frontend-config';

const messages = defineMessages({
  verified: { id: 'account.verified', defaultMessage: 'Verified account' },
});

interface IVerificationBadge {
  className?: string;
}

const VerificationBadge: React.FC<IVerificationBadge> = ({ className }) => {
  const intl = useIntl();
  const frontendConfig = useFrontendConfig();

  // Prefer a custom icon if found
  const icon = frontendConfig.verifiedIcon || iconCheck;

  // Render component based on file extension
  const Element = icon.endsWith('.svg') ? Icon : 'img';

  return (
    <span className='verification-badge' data-testid='verified-badge'>
      <Element className={className} src={icon} alt={intl.formatMessage(messages.verified)} />
    </span>
  );
};

export { VerificationBadge as default };
