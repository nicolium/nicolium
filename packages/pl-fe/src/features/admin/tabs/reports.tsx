import React from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import ScrollableList from 'pl-fe/components/scrollable-list';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { useReports } from 'pl-fe/queries/admin/use-reports';

import Report from '../components/report';

const messages = defineMessages({
  heading: { id: 'column.admin.reports', defaultMessage: 'Reports' },
  modlog: { id: 'column.admin.reports.menu.moderation_log', defaultMessage: 'Moderation log' },
  emptyMessage: { id: 'admin.reports.empty_message', defaultMessage: 'There are no open reports. If a user gets reported, they will show up here.' },
});

const Reports: React.FC = () => {
  const intl = useIntl();
  const [params, setParams] = useSearchParams();

  const resolved = params.get('resolved');
  const accountId = params.get('account_id') || undefined;
  const targetAccountId = params.get('target_account_id') || undefined;

  const { account } = useAccount(accountId);
  const { account: targetAccount } = useAccount(targetAccountId);

  const { data: reportIds = [], isPending } = useReports({
    resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
    account_id: accountId,
    target_account_id: targetAccountId,
  });

  const handleUnsetAccounts = () => {
    params.delete('account_id');
    params.delete('target_account_id');
    setParams(params => Object.fromEntries(params.entries()));
  };

  return (
    <>
      {(accountId || targetAccountId) && (
        <HStack className='border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800' alignItems='center' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/outline/x.svg')} onClick={handleUnsetAccounts} />
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
        emptyMessage={intl.formatMessage(messages.emptyMessage)}
        listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
      >
        {reportIds.map(report => report && <Report id={report} key={report} />)}
      </ScrollableList>
    </>
  );
};

export { Reports as default };
