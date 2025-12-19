import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import ScrollableList from 'pl-fe/components/scrollable-list';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { adminReportsRoute } from 'pl-fe/features/ui/router';
import { useReports } from 'pl-fe/queries/admin/use-reports';

import Report from '../components/report';

const Reports: React.FC = () => {
  const { resolved, account_id: accountId, target_account_id: targetAccountId } = adminReportsRoute.useSearch();
  const navigate = useNavigate({ from: adminReportsRoute.fullPath });

  const { account } = useAccount(accountId);
  const { account: targetAccount } = useAccount(targetAccountId);

  const { data: reportIds = [], isPending, hasNextPage, fetchNextPage } = useReports({
    resolved,
    account_id: accountId,
    target_account_id: targetAccountId,
  });

  const handleUnsetAccounts = () => navigate({ search: (prev) => ({ resolved: prev.resolved }) });

  return (
    <>
      {(accountId || targetAccountId) && (
        <HStack className='border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800' alignItems='center' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@phosphor-icons/core/regular/x.svg')} onClick={handleUnsetAccounts} />
          <Text>
            <FormattedMessage
              id='column.admin.reports.filter_message'
              defaultMessage='You are displaying reports {query}.'
              values={{ query: <FormattedList value={[
                account && <FormattedMessage
                  id='column.admin.reports.filter_message.account'
                  defaultMessage='from @{acct}'
                  values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
                />,
                targetAccount && <FormattedMessage
                  id='column.admin.reports.filter_message.target_account'
                  defaultMessage='targeting @{acct}'
                  values={{ acct: <strong className='break-words'>{targetAccount?.acct}</strong> }}
                />,
              ]}
              /> }}
            />
          </Text>
        </HStack>
      )}
      <ScrollableList
        scrollKey='adminReports'
        isLoading={isPending}
        showLoading={isPending}
        emptyMessageText={<FormattedMessage id='admin.reports.empty_message' defaultMessage='There are no open reports. If a user gets reported, they will show up here.' />}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        itemClassName='pt-4'
      >
        {reportIds.map(report => report && <Report id={report} key={report} />)}
      </ScrollableList>
    </>
  );
};

export { Reports as default };
