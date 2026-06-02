import iconAppWindow from '@phosphor-icons/core/regular/app-window.svg';
import iconBug from '@phosphor-icons/core/regular/bug.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconSquaresFour from '@phosphor-icons/core/regular/squares-four.svg';
import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import iconWifiX from '@phosphor-icons/core/regular/wifi-x.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import toast from '@/toast';
import sourceCode from '@/utils/code';

const messages = defineMessages({
  heading: { id: 'column.developers', defaultMessage: 'Developers' },
});

interface IDashWidget extends Partial<LinkOptions> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

const DashWidget: React.FC<IDashWidget> = ({ to, onClick, children, ...rest }) =>
  to ? (
    <Link className='developers__widget' to={to} {...rest}>
      {children}
    </Link>
  ) : (
    <button className='developers__widget' onClick={onClick}>
      {children}
    </button>
  );

const DevelopersPage: React.FC = () => {
  const intl = useIntl();

  const showToast = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.success('meow!', {
      action: () => {
        alert('meow :3');
      },
      actionLabel: 'meow',
    });
  };

  return (
    <>
      <Column label={intl.formatMessage(messages.heading)}>
        <div className='developers'>
          <DashWidget to='/developers/apps/create'>
            <Icon src={iconSquaresFour} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.app_create.label'
                defaultMessage='Create an app'
              />
            </p>
          </DashWidget>

          <DashWidget to='/developers/settings_store'>
            <Icon src={iconCode} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.settings_store.label'
                defaultMessage='Settings store'
              />
            </p>
          </DashWidget>

          <DashWidget to='/error'>
            <Icon src={iconBug} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.intentional_error.label'
                defaultMessage='Trigger an error'
              />
            </p>
          </DashWidget>

          <DashWidget to='/error/network'>
            <Icon src={iconWifiX} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.network_error.label'
                defaultMessage='Network error'
              />
            </p>
          </DashWidget>

          <DashWidget to='/developers/sw'>
            <Icon src={iconAppWindow} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.service_worker.label'
                defaultMessage='Service Worker'
              />
            </p>
          </DashWidget>

          <DashWidget onClick={showToast}>
            <Icon src={iconWarning} aria-hidden />

            <p>
              <FormattedMessage
                id='developers.navigation.show_toast'
                defaultMessage='Trigger Toast'
              />
            </p>
          </DashWidget>
        </div>
      </Column>

      <p className='developers__footer'>
        {sourceCode.displayName} {sourceCode.version}
      </p>
    </>
  );
};

export { DevelopersPage as default };
