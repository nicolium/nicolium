import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Widget from '@/components/ui/widget';
import Emojify from '@/features/emoji/emojify';
import { WhoToFollowPanel } from '@/features/ui/util/async-components';
import { useEndorsedAccounts } from '@/queries/accounts/use-endorsed-accounts';

import type { Account } from 'pl-api';

interface IPinnedAccountsPanel {
  account: Pick<Account, 'id' | 'display_name' | 'emojis'>;
  limit: number;
}

const PinnedAccountsPanel: React.FC<IPinnedAccountsPanel> = ({ account, limit }) => {
  const { data: pinned = [] } = useEndorsedAccounts(account.id);

  if (!pinned.length) {
    return <WhoToFollowPanel limit={limit} />;
  }

  return (
    <Widget
      title={
        <FormattedMessage
          id='pinned_accounts.title'
          defaultMessage='{name}’s choices'
          values={{
            name: (
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
            ),
          }}
        />
      }
    >
      {pinned &&
        pinned.map((suggestion) => (
          <AccountContainer key={suggestion} id={suggestion} withRelationship={false} />
        ))}
    </Widget>
  );
};

export { PinnedAccountsPanel as default };
