import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';

interface IAltIndicator extends Pick<React.HTMLAttributes<HTMLSpanElement>, 'title' | 'className'> {
  warning?: boolean;
  message?: React.JSX.Element;
}

const AltIndicator: React.FC<IAltIndicator> = React.forwardRef<HTMLSpanElement, IAltIndicator>(
  ({ className, warning, message, ...props }, ref) => (
    <span className={clsx('alt-indicator', className)} {...props} ref={ref}>
      {warning && <Icon src={iconWarning} aria-hidden />}
      {message ?? (
        <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
      )}
    </span>
  ),
);

AltIndicator.displayName = 'AltIndicator';

export default AltIndicator;
