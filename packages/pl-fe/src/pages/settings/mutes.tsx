import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';
import { useMutes } from 'pl-fe/queries/account-lists/use-blocks';

const messages = defineMessages({
  heading: { id: 'column.mutes', defaultMessage: 'Mutes' },
});

const MutesPage: React.FC = () => {
  const intl = useIntl();

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useMutes();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <ScrollableList
          itemClassName={clsx('pb-4', { 'last:pb-0': !hasNextPage })}
          scrollKey='mutes'
          isLoading={isFetching}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
          emptyMessage={
            <FormattedMessage id='empty_column.mutes' defaultMessage="You haven't muted any users yet." />
          }
          emptyMessageCard={false}
        >
          {data.map((accountId) =>
            <AccountContainer key={accountId} id={accountId} actionType='muting' />,
          )}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export { MutesPage as default };
