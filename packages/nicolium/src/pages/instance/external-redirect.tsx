import iconLinkSimpleHorizontal from '@phosphor-icons/core/regular/link-simple-horizontal.svg';
import { Navigate, useLocation } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { EmptyMessage } from '@/components/empty-message';
import Column from '@/components/ui/column';
import { useInstance } from '@/stores/instance';

const messages = defineMessages({
  heading: { id: 'column.external_redirect', defaultMessage: 'External redirect' },
});

const ExternalRedirect: React.FC = () => {
  const intl = useIntl();
  const instance = useInstance();
  const location = useLocation();

  const redirectTarget = location.state?.redirectTarget;

  if (!redirectTarget) {
    return <Navigate to='/' />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <EmptyMessage
        icon={iconLinkSimpleHorizontal}
        heading={
          <FormattedMessage
            id='external_redirect.heading'
            defaultMessage='You are about to leave {instance}'
            values={{ instance: instance.title }}
          />
        }
        text={
          <div className='external-redirect__text'>
            <p>
              <FormattedMessage
                id='external_redirect.text'
                defaultMessage='Click the link if you trust it.'
              />
            </p>

            <a href={redirectTarget} rel='noopener noreferrer'>
              {redirectTarget}
            </a>
          </div>
        }
      />
    </Column>
  );
};

export { ExternalRedirect as default };
