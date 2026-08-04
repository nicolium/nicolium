import iconCake from '@phosphor-icons/core/regular/cake.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AccountComponent from '@/components/accounts/account';
import Icon from '@/components/ui/icon';
import { useAccount } from '@/queries/accounts/use-account';

const messages = defineMessages({
  birthday: { id: 'account.birthday', defaultMessage: 'Born {date}' },
});

interface IBirthdayAccount {
  accountId: string;
}

/** Account displayed together with its birth date. */
const BirthdayAccount: React.FC<IBirthdayAccount> = ({ accountId }) => {
  const intl = useIntl();
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  const birthday = account.birthday;
  if (!birthday) return null;

  const formattedBirthday = intl.formatDate(birthday, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <AccountComponent
      account={account}
      withRelationship={false}
      action={
        <div
          className='birthday-account__label'
          title={intl.formatMessage(messages.birthday, {
            date: formattedBirthday,
          })}
        >
          <Icon src={iconCake} aria-hidden />
          {formattedBirthday}
        </div>
      }
    />
  );
};

export { BirthdayAccount as default };
