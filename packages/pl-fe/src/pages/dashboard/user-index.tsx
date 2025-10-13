import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAdminAccounts } from 'pl-fe/queries/admin/use-accounts';

import { SearchInput } from '../search/search';

const messages = defineMessages({
  heading: { id: 'column.admin.users', defaultMessage: 'Users' },
});


const UserIndexPage: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';

  const intl = useIntl();

  const { data: accountIds, isPending, isFetching, hasNextPage, fetchNextPage } = useAdminAccounts({
    origin: 'local',
    status: 'active',
    username: query,
  });

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <SearchInput />
      <ScrollableList
        scrollKey='userIndex'
        hasMore={hasNextPage}
        isLoading={isFetching}
        showLoading={isPending}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={<FormattedMessage id='admin.user_index.empty' defaultMessage='No users found.' />}
        itemClassName='pb-4'
      >
        {(accountIds || []).map(id =>
          <AccountContainer key={id} id={id} withDate />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { UserIndexPage as default };
