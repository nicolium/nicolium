import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';
import { adminUsersRoute } from 'pl-fe/features/ui/router';
import { useAdminAccounts } from 'pl-fe/queries/admin/use-accounts';

import { SearchInput } from '../search/search';

const messages = defineMessages({
  heading: { id: 'column.admin.users', defaultMessage: 'Users' },
});

const UserIndexPage: React.FC = () => {
  const { q: query } = adminUsersRoute.useSearch();

  const intl = useIntl();

  const { data: accountIds, isPending, isFetching, hasNextPage, fetchNextPage } = useAdminAccounts({
    origin: 'local',
    status: 'active',
    username: query,
  });

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={2}>
        <SearchInput query={query} />
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
      </Stack>
    </Column>
  );
};

export { UserIndexPage as default };
