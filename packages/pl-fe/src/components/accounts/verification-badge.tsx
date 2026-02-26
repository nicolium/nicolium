import clsx from 'clsx';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useFrontendConfig } from '@/hooks/use-frontend-config';

const messages = defineMessages({
  verified: { id: 'account.verified', defaultMessage: 'Verified Account' },
});

interface IVerificationBadge {
  className?: string;
}

const VerificationBadge: React.FC<IVerificationBadge> = ({ className }) => {
  const intl = useIntl();
  const frontendConfig = useFrontendConfig();

  // Prefer a custom icon if found
  const icon = frontendConfig.verifiedIcon || require('@phosphor-icons/core/regular/check.svg');

  // Render component based on file extension
  const Element = icon.endsWith('.svg') ? Icon : 'img';

  return (
    <span className='rounded-full bg-accent-500' data-testid='verified-badge'>
      <Element
        className={clsx(
          'size-[16px] rounded-full bg-accent-500 stroke-[4] p-px text-white',
          className,
        )}
        src={icon}
        alt={intl.formatMessage(messages.verified)}
      />
    </span>
  );
};

export { VerificationBadge as default };
