import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Domain from 'pl-fe/components/domain';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { domainBlocksQueryOptions } from 'pl-fe/queries/settings/domain-blocks';

const messages = defineMessages({
  heading: { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

const DomainBlocksPage: React.FC = () => {
  const intl = useIntl();

  const { data: domains, hasNextPage, fetchNextPage } = useInfiniteQuery(domainBlocksQueryOptions);

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

  const emptyMessage = <FormattedMessage id='empty_column.domain_blocks' defaultMessage='There are no hidden domains yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='domainBlocks'
        onLoadMore={handleLoadMore}
        hasMore={hasNextPage}
        emptyMessageText={emptyMessage}
        listClassName='divide-y divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
      >
        {domains.map((domain) =>
          <Domain key={domain} domain={domain} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { DomainBlocksPage as default };
