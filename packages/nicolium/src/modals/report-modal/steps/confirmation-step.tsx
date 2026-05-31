import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useFrontendConfig } from '@/hooks/use-frontend-config';

const termsOfServiceText = <FormattedMessage id='shared.tos' defaultMessage='Terms of Service' />;

const renderTermsOfServiceLink = (href: string) => (
  <a href={href} target='_blank'>
    {termsOfServiceText}
  </a>
);

const ConfirmationStep: React.FC = () => {
  const { links } = useFrontendConfig();

  return (
    <div className='report-modal__confirmation-step'>
      <h1 className='report-modal__confirmation-step__title'>
        <FormattedMessage
          id='report.confirmation.title'
          defaultMessage='Thanks for submitting your report.'
        />
      </h1>

      <p className='report-modal__confirmation-step__text'>
        <FormattedMessage
          id='report.confirmation.content'
          defaultMessage='If we find that this {entity} is violating the {link} we will take further action on the matter.'
          values={{
            entity: (
              <FormattedMessage id='report.confirmation.entity.account' defaultMessage='account' />
            ),
            link: links?.termsOfService
              ? renderTermsOfServiceLink(links.termsOfService)
              : termsOfServiceText,
          }}
        />
      </p>
    </div>
  );
};

export { ConfirmationStep as default };
