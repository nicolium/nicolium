import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useBlocks } from 'pl-fe/queries/account-lists/use-blocks';

const messages = defineMessages({
  heading: { id: 'column.blocks', defaultMessage: 'Blocks' },
});

const BlocksPage: React.FC = () => {
  const intl = useIntl();

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetching,
  } = useBlocks();

  if (isLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.blocks' defaultMessage="You haven't blocked any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='blocks'
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        emptyMessage={emptyMessage}
        emptyMessageCard={false}
        itemClassName={clsx('pb-4', { 'last:pb-0': !hasNextPage })}
        isLoading={isFetching}
      >
        {data.map((accountId) => (
          <AccountContainer key={accountId} id={accountId} actionType='blocking' />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { BlocksPage as default };
