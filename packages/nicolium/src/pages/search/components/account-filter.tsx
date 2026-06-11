import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import IconButton from '@/components/ui/icon-button';
import { useAccount } from '@/queries/accounts/use-account';

const messages = defineMessages({
  clearAccountFilter: { id: 'search.clear_account_filter', defaultMessage: 'Clear account filter' },
});

interface IAccountFilter {
  accountId: string;
  handleUnsetAccount: () => void;
}

const AccountFilter: React.FC<IAccountFilter> = ({ accountId, handleUnsetAccount }) => {
  const intl = useIntl();
  const { data: account } = useAccount(accountId);

  return (
    <div className='search-page__account'>
      <IconButton
        src={iconX}
        onClick={handleUnsetAccount}
        title={intl.formatMessage(messages.clearAccountFilter)}
      />
      <p>
        <FormattedMessage
          id='search_results.filter_message'
          defaultMessage='You are searching for posts from @{acct}.'
          values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
        />
      </p>
    </div>
  );
};

export { AccountFilter };
