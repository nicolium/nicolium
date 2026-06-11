import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import IconButton from '@/components/ui/icon-button';

import type { Account } from 'pl-api';

const messages = defineMessages({
  clearAccountFilter: { id: 'search.clear_account_filter', defaultMessage: 'Clear account filter' },
});

interface IAccountFilter {
  account?: Pick<Account, 'acct'>;
  handleUnsetAccount: () => void;
}

const AccountFilter: React.FC<IAccountFilter> = ({ account, handleUnsetAccount }) => {
  const intl = useIntl();

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
