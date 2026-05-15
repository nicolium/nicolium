import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import PullToRefresh from '@/components/pull-to-refresh';
import StatusList from '@/components/statuses/status-list';
import Column from '@/components/ui/column';
import Toggle from '@/components/ui/toggle';
import { useAccount } from '@/queries/accounts/use-account';
import { useAdminAccountStatuses } from '@/queries/admin/use-account-statuses';
import { adminAccountStatusesRoute } from '@/router';

const messages = defineMessages({
  header: { id: 'column.admin.account_statuses', defaultMessage: 'All posts by @{acct}' },
});

const AccountStatusesPage: React.FC = () => {
  const { accountId } = adminAccountStatusesRoute.useParams();
  const params = adminAccountStatusesRoute.useSearch();

  const navigate = useNavigate({ from: adminAccountStatusesRoute.fullPath });

  const { data: account } = useAccount(accountId);

  const {
    data: statusIds = [],
    isFetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useAdminAccountStatuses(accountId, params);

  const handleRefresh = () => refetch();

  const intl = useIntl();

  return (
    <Column
      label={intl.formatMessage(messages.header, { acct: account?.acct || '' })}
      bodyClassName='flex flex-col gap-4'
    >
      <List>
        <ListItem
          label={
            <FormattedMessage
              id='admin.accounts.statuses.with_private'
              defaultMessage='Include private posts'
            />
          }
        >
          <Toggle
            checked={params.with_private}
            onChange={({ target }) =>
              navigate({ search: (params) => ({ ...params, with_private: target.checked }) })
            }
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='admin.accounts.statuses.with_reblogs'
              defaultMessage='Include reposts'
            />
          }
        >
          <Toggle
            checked={params.with_reblogs}
            onChange={({ target }) =>
              navigate({ search: (params) => ({ ...params, with_reblogs: target.checked }) })
            }
          />
        </ListItem>
      </List>

      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          statusIds={statusIds}
          scrollKey='account_statuses'
          hasMore={hasNextPage}
          isLoading={isFetching}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          emptyMessageText={
            <FormattedMessage
              id='empty_column.admin_account_timeline'
              defaultMessage='There are no posts by this account yet.'
            />
          }
          emptyMessageIcon={iconChatCenteredText}
        />
      </PullToRefresh>
    </Column>
  );
};

export { AccountStatusesPage as default };
