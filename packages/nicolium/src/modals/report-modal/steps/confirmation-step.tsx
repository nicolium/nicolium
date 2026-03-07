import React from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useAppSelector } from '@/hooks/use-app-selector';

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
  const links = useAppSelector((state) => state.frontendConfig.links);

  return (
    <Stack space={1}>
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
    </Stack>
  );
};

export { ConfirmationStep as default };
