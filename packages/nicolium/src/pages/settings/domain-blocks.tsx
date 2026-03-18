import iconLockOpen from '@phosphor-icons/core/regular/lock-open.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import { useUnblockDomainMutation } from '@/queries/settings/domain-blocks';
import { useDomainBlocksQuery } from '@/queries/settings/domain-blocks';

const messages = defineMessages({
  heading: { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

interface IDomain {
  domain: string;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const intl = useIntl();

  const { mutate: unblockDomain } = useUnblockDomainMutation();

  const handleDomainUnblock = () => {
    unblockDomain(domain);
  };

  return (
    <div className='flex items-center justify-between gap-1 p-2'>
      <Text tag='span'>{domain}</Text>
      <IconButton
        iconClassName='h-5 w-5'
        src={iconLockOpen}
        title={intl.formatMessage(messages.unblockDomain, { domain })}
        onClick={handleDomainUnblock}
      />
    </div>
  );
};

const DomainBlocksPage: React.FC = () => {
  const intl = useIntl();

  const { data: domains, hasNextPage, fetchNextPage } = useDomainBlocksQuery();

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage({ cancelRefetch: false });
    }
  };

  if (!domains) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.domain_blocks'
      defaultMessage='There are no hidden domains yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='domainBlocks'
        onLoadMore={handleLoadMore}
        hasMore={hasNextPage}
        emptyMessageText={emptyMessage}
        listClassName='divide-y divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
      >
        {domains.map((domain) => (
          <Domain key={domain} domain={domain} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { DomainBlocksPage as default };
