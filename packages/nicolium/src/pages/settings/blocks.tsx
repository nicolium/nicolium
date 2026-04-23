import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useBlocks } from '@/queries/account-lists/use-blocks';

const messages = defineMessages({
  heading: { id: 'column.blocks', defaultMessage: 'Blocks' },
});

const BlocksPage: React.FC = () => {
  const intl = useIntl();

  const { data = [], hasNextPage, fetchNextPage, isLoading, isFetching } = useBlocks();

  if (isLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.blocks'
      defaultMessage="You haven't blocked any users yet."
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='blocks'
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        emptyMessageText={emptyMessage}
        itemClassName={clsx('pb-4', { 'last:pb-0': !hasNextPage })}
        isLoading={isFetching}
      >
        {data.map(([accountId, blockExpiresAt]) => (
          <AccountContainer
            key={accountId}
            id={accountId}
            actionType='blocking'
            blockExpiresAt={blockExpiresAt}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { BlocksPage as default };
