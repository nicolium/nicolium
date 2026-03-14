import React from 'react';
import { FormattedMessage } from 'react-intl';

import Text from '@/components/ui/text';
import { useFrontendConfig } from '@/hooks/use-frontend-config';

const termsOfServiceText = <FormattedMessage id='shared.tos' defaultMessage='Terms of Service' />;

const renderTermsOfServiceLink = (href: string) => (
  <a
    href={href}
    target='_blank'
    className='text-primary-600 hover:text-primary-800 hover:underline dark:text-primary-400 dark:hover:text-primary-400'
  >
    {termsOfServiceText}
  </a>
);

const ConfirmationStep: React.FC = () => {
  const { links } = useFrontendConfig();

  return (
    <div className='flex flex-col gap-1'>
      <Text weight='semibold' tag='h1' size='xl'>
        <FormattedMessage
          id='report.confirmation.title'
          defaultMessage='Thanks for submitting your report.'
        />
      </Text>

      <Text>
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
      </Text>
    </div>
  );
};

export { ConfirmationStep as default };
