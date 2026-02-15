import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';

interface IAltIndicator extends Pick<React.HTMLAttributes<HTMLSpanElement>, 'title' | 'className'> {
  warning?: boolean;
  message?: JSX.Element;
}

const AltIndicator: React.FC<IAltIndicator> = React.forwardRef<HTMLSpanElement, IAltIndicator>(
  ({ className, warning, message, ...props }, ref) => (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded bg-gray-900 px-2 py-1 text-xs font-medium uppercase text-white',
        className,
      )}
      {...props}
      ref={ref}
    >
      {warning && (
        <Icon className='size-4' src={require('@phosphor-icons/core/regular/warning.svg')} />
      )}
      {message ?? (
        <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
      )}
    </span>
  ),
);

export default AltIndicator;
