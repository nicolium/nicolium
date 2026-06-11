import iconX from '@phosphor-icons/core/regular/x.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import IconButton from '@/components/ui/icon-button';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

interface IHeader {
  accountId: string;
  statusId: string;
  onClose: () => void;
}

/** Account row and close button shown above the picture-in-picture player. */
const Header: React.FC<IHeader> = ({ accountId, statusId, onClose }) => {
  const intl = useIntl();
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  return (
    <div className='picture-in-picture__header'>
      <Link
        to='/@{$username}/posts/$statusId'
        params={{ username: account.acct, statusId }}
        className='picture-in-picture__header__account'
      >
        <Avatar
          src={account.avatar}
          size={36}
          alt={account.avatar_description}
          isCat={account.is_cat}
          username={account.username}
        />
        <span className='picture-in-picture__header__name'>
          <Emojify text={account.display_name} emojis={account.emojis} truncated />
        </span>
      </Link>

      <IconButton src={iconX} onClick={onClose} title={intl.formatMessage(messages.close)} />
    </div>
  );
};

export { Header as default };
