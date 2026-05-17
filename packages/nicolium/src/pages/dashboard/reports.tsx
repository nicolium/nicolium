import iconX from '@phosphor-icons/core/regular/x.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Tabs, { type Item } from '@/components/ui/tabs';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import Report from '@/pages/dashboard/components/report';
import { useAccount } from '@/queries/accounts/use-account';
import { useReports } from '@/queries/admin/use-reports';
import { adminReportsRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.admin.reports', defaultMessage: 'Reports' },
  clearFilter: { id: 'column.admin.reports.clear_filter', defaultMessage: 'Clear filter' },
});

const Reports: React.FC = () => {
  const features = useFeatures();
  const intl = useIntl();

  const {
    resolved,
    account_id: accountId,
    target_account_id: targetAccountId,
  } = adminReportsRoute.useSearch();
  const navigate = useNavigate({ from: adminReportsRoute.fullPath });

  const { data: account } = useAccount(accountId);
  const { data: targetAccount } = useAccount(targetAccountId);

  const {
    data: reportIds = [],
    isPending,
    hasNextPage,
    fetchNextPage,
  } = useReports({
    resolved: resolved !== false ? true : undefined,
    unresolved: resolved !== true ? true : undefined,
    account_id: accountId,
    target_account_id: targetAccountId,
  });

  const handleUnsetAccounts = () => navigate({ search: (prev) => ({ resolved: prev.resolved }) });

  const tabItems = useMemo(() => {
    const items: Array<Item> = [];

    if (features.mastodonAdminUnresolvedReports) {
      items.push({
        text: <FormattedMessage id='column.admin.reports.tabs.all' defaultMessage='All' />,
        to: '/nicolium/admin/reports',
        search: (query) => ({ ...query, resolved: undefined }),
        name: 'all',
      });
    }

    items.push(
      {
        text: <FormattedMessage id='column.admin.reports.tabs.open' defaultMessage='Open' />,
        to: '/nicolium/admin/reports',
        search: (query) => ({ ...query, resolved: false }),
        name: 'open',
      },
      {
        text: (
          <FormattedMessage id='column.admin.reports.tabs.resolved' defaultMessage='Resolved' />
        ),
        to: '/nicolium/admin/reports',
        search: (query) => ({ ...query, resolved: true }),
        name: 'resolved',
      },
    );

    return items;
  }, [intl]);

  return (
    <Column label={intl.formatMessage(messages.heading)} bodyClassName='flex flex-col gap-4'>
      <Tabs
        items={tabItems}
        activeItem={resolved ? 'resolved' : resolved === false ? 'open' : 'all'}
      />

      {(accountId ?? targetAccountId) && (
        <div className='flex items-center gap-2 border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800'>
          <IconButton
            iconClassName='h-5 w-5'
            src={iconX}
            onClick={handleUnsetAccounts}
            title={intl.formatMessage(messages.clearFilter)}
          />
          <Text>
            <FormattedMessage
              id='column.admin.reports.filter_message'
              defaultMessage='You are displaying reports {query}.'
              values={{
                query: (
                  <FormattedList
                    value={[
                      account && (
                        <FormattedMessage
                          key='account'
                          id='column.admin.reports.filter_message.account'
                          defaultMessage='from @{acct}'
                          values={{
                            acct: <strong className='break-words'>{account?.acct}</strong>,
                          }}
                        />
                      ),
                      targetAccount && (
                        <FormattedMessage
                          key='targetAccount'
                          id='column.admin.reports.filter_message.target_account'
                          defaultMessage='targeting @{acct}'
                          values={{
                            acct: <strong className='break-words'>{targetAccount?.acct}</strong>,
                          }}
                        />
                      ),
                    ]}
                  />
                ),
              }}
            />
          </Text>
        </div>
      )}

      <ScrollableList
        scrollKey='adminReports'
        isLoading={isPending}
        showLoading={isPending}
        emptyMessageText={
          <FormattedMessage
            id='admin.reports.empty_message'
            defaultMessage='There are no open reports. If a user gets reported, they will show up here.'
          />
        }
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        itemClassName='pt-4 first:pt-0'
      >
        {reportIds.map((report) => report && <Report id={report} key={report} />)}
      </ScrollableList>
    </Column>
  );
};

export { Reports as default };
