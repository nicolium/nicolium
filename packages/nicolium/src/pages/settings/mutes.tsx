import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import { useMutes } from '@/queries/account-lists/use-blocks';

const messages = defineMessages({
  heading: { id: 'column.mutes', defaultMessage: 'Mutes' },
});

const MutesPage: React.FC = () => {
  const intl = useIntl();

  const { data = [], hasNextPage, fetchNextPage, isFetching } = useMutes();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        itemClassName={clsx('account-list__item', { 'account-list__item--last': !hasNextPage })}
        scrollKey='mutes'
        isLoading={isFetching}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.mutes'
            defaultMessage='You haven’t muted any users yet.'
          />
        }
      >
        {data.map(([accountId, muteExpiresAt]) => (
          <AccountContainer
            key={accountId}
            id={accountId}
            actionType='muting'
            muteExpiresAt={muteExpiresAt}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { MutesPage as default };
