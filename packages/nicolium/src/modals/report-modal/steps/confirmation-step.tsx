import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useAppSelector } from '@/hooks/use-app-selector';

const messages = defineMessages({
  accountEntity: { id: 'report.confirmation.entity.account', defaultMessage: 'account' },
  title: { id: 'report.confirmation.title', defaultMessage: 'Thanks for submitting your report.' },
  content: {
    id: 'report.confirmation.content',
    defaultMessage:
      'If we find that this {entity} is violating the {link} we will take further action on the matter.',
  },
});

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
  const intl = useIntl();
  const links = useAppSelector((state) => state.frontendConfig.links);

  const entity = intl.formatMessage(messages.accountEntity);

  return (
    <Stack space={1}>
      <Text weight='semibold' tag='h1' size='xl'>
        <FormattedMessage
          id='report.confirmation.title'
          defaultMessage='Thanks for submitting your report.'
        />
        {intl.formatMessage(messages.title)}
      </Text>

      <Text>
        <FormattedMessage
          id='report.confirmation.content'
          defaultMessage='If we find that this {entity} is violating the {link} we will take further action on the matter.'
          values={{
            entity,
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
