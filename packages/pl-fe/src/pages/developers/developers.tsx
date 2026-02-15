import { Link, type LinkOptions } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import SvgIcon from '@/components/ui/svg-icon';
import Text from '@/components/ui/text';
import toast from '@/toast';
import sourceCode from '@/utils/code';

const messages = defineMessages({
  heading: { id: 'column.developers', defaultMessage: 'Developers' },
});

interface IDashWidget extends Partial<LinkOptions> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

const DashWidget: React.FC<IDashWidget> = ({ to, onClick, children, ...rest }) => {
  const className = 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800/75 p-4 rounded flex flex-col items-center justify-center space-y-2';

  if (to) {
    return <Link className={className} to={to} {...rest}>{children}</Link>;
  } else {
    return <button className={className} onClick={onClick}>{children}</button>;
  }
};

const DevelopersPage: React.FC = () => {
  const intl = useIntl();

  const showToast = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.success('Hello world!', {
      action: () =>{
        alert('hi');
      },
      actionLabel: 'Click me',
    });
  };

  return (
    <>
      <Column label={intl.formatMessage(messages.heading)}>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <DashWidget to='/developers/apps/create'>
            <SvgIcon src={require('@phosphor-icons/core/regular/squares-four.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.app_create_label' defaultMessage='Create an app' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/settings_store'>
            <SvgIcon src={require('@phosphor-icons/core/regular/code.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.settings_store_label' defaultMessage='Settings store' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/timeline'>
            <SvgIcon src={require('@phosphor-icons/core/regular/list-bullets.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.test_timeline_label' defaultMessage='Test timeline' />
            </Text>
          </DashWidget>

          <DashWidget to='/error'>
            <SvgIcon src={require('@phosphor-icons/core/regular/bug.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.intentional_error_label' defaultMessage='Trigger an error' />
            </Text>
          </DashWidget>

          <DashWidget to='/error/network'>
            <SvgIcon src={require('@phosphor-icons/core/regular/wifi-x.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.network_error_label' defaultMessage='Network error' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/sw'>
            <SvgIcon src={require('@phosphor-icons/core/regular/app-window.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.service_worker_label' defaultMessage='Service Worker' />
            </Text>
          </DashWidget>

          <DashWidget onClick={showToast}>
            <SvgIcon src={require('@phosphor-icons/core/regular/warning.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.show_toast' defaultMessage='Trigger Toast' />
            </Text>
          </DashWidget>
        </div>
      </Column>

      <div className='p-4'>
        <Text align='center' theme='subtle' size='sm'>
          {sourceCode.displayName} {sourceCode.version}
        </Text>
      </div>
    </>
  );
};

export { DevelopersPage as default };
