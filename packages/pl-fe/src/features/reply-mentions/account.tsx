import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AccountComponent from '@/components/accounts/account';
import IconButton from '@/components/ui/icon-button';
import { useAccount } from '@/queries/accounts/use-account';
import { useCompose, useComposeActions } from '@/stores/compose';

const messages = defineMessages({
  remove: { id: 'reply_mentions.account.remove', defaultMessage: 'Remove from mentions' },
  add: { id: 'reply_mentions.account.add', defaultMessage: 'Add to mentions' },
});

interface IAccount {
  composeId: string;
  accountId: string;
  author: boolean;
}

const Account: React.FC<IAccount> = ({ composeId, accountId, author }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);
  const { data: account } = useAccount(accountId);
  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        draft.to = draft.to?.filter((acct) => acct !== account.acct) || [];
      }
    });
  const onAdd = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        if (draft.to?.includes(account.acct)) return;
        draft.to = [...(draft.to || []), account.acct];
      }
    });

  if (!account) return null;

  let button;

  if (added) {
    button = (
      <IconButton
        src={require('@phosphor-icons/core/regular/x.svg')}
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        title={intl.formatMessage(messages.remove)}
        onClick={onRemove}
      />
    );
  } else {
    button = (
      <IconButton
        src={require('@phosphor-icons/core/regular/plus.svg')}
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        title={intl.formatMessage(messages.add)}
        onClick={onAdd}
      />
    );
  }

  return (
    <div className='p-2'>
      <AccountComponent
        account={account}
        withRelationship={false}
        withLinkToProfile={false}
        action={author ? undefined : button}
      />
    </div>
  );
};

export { Account as default };
