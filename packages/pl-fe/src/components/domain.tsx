import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { unblockDomainMutationOptions } from 'pl-fe/queries/settings/domain-blocks';

const messages = defineMessages({
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

interface IDomain {
  domain: string;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const intl = useIntl();

  const { mutate: unblockDomain } = useMutation(unblockDomainMutationOptions);

  // const onBlockDomain = () => {
  //   openModal('CONFIRM', {
  //     heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
  //     message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable.' values={{ domain: <strong>{domain}</strong> }} />,
  //     confirm: intl.formatMessage(messages.blockDomainConfirm),
  //     onConfirm: () => blockDomain(domain),
  //   });
  // }

  const handleDomainUnblock = () => {
    unblockDomain(domain);
  };

  return (
    <HStack alignItems='center' justifyContent='between' space={1} className='p-2'>
      <Text tag='span'>
        {domain}
      </Text>
      <IconButton iconClassName='h-5 w-5' src={require('@phosphor-icons/core/regular/lock-open.svg')} title={intl.formatMessage(messages.unblockDomain, { domain })} onClick={handleDomainUnblock} />
    </HStack>
  );
};

export { Domain as default };
