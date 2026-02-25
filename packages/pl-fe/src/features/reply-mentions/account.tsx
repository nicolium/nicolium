import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addToMentions, removeFromMentions } from '@/actions/compose';
import AccountComponent from '@/components/account';
import IconButton from '@/components/ui/icon-button';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useAccount } from '@/queries/accounts/use-account';

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
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const { data: account } = useAccount(accountId);
  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () => dispatch(removeFromMentions(composeId, accountId));
  const onAdd = () => dispatch(addToMentions(composeId, accountId));

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
