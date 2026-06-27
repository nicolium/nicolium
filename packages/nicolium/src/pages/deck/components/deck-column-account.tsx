import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import DropdownMenu from '@/components/dropdown-menu';
import Avatar from '@/components/ui/avatar';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAuthStore } from '@/stores/auth';

import { deckMessages as messages } from '../utils/messages';

import { updateDeckColumn } from './deck-column-config';

import type { DeckColumn } from '@/schemas/frontend-settings';

const CurrentAccountAvatar: React.FC = () => {
  const { data: account } = useOwnAccount();

  return (
    <Avatar
      src={account?.avatar_static ?? account?.avatar ?? ''}
      size={28}
      username={account?.acct}
      isCat={account?.is_cat}
    />
  );
};

interface IAccountOption {
  accountUrl: string;
  active: boolean;
  onSelect: () => void;
}

const AccountOptionBody: React.FC<Pick<IAccountOption, 'active' | 'onSelect'>> = ({
  active,
  onSelect,
}) => {
  const { data: account } = useOwnAccount();

  if (!account) return null;

  return (
    <button
      type='button'
      className={clsx('deck__column__account-option', {
        'deck__column__account-option--active': active,
      })}
      aria-pressed={active}
      onClick={onSelect}
    >
      <Account
        account={account}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        hideActions
      />
    </button>
  );
};

const AccountOption: React.FC<IAccountOption> = ({ accountUrl, active, onSelect }) => (
  <CurrentAccountProvider accountUrl={accountUrl}>
    <AccountOptionBody active={active} onSelect={onSelect} />
  </CurrentAccountProvider>
);

interface IDeckColumnAccountButton {
  column: DeckColumn;
}

const DeckColumnAccountButton: React.FC<IDeckColumnAccountButton> = ({ column }) => {
  const intl = useIntl();
  const users = useAuthStore((state) => state.users);
  const mainAccountUrl = useAuthStore((state) => state.me);

  const accountUrls = useMemo(() => Object.keys(users).filter((url) => users[url]?.id), [users]);

  const activeAccountUrl =
    column.accountUrl && users[column.accountUrl] ? column.accountUrl : mainAccountUrl;

  const Component = useMemo(
    () =>
      ({ handleClose }: { handleClose: () => any }) => (
        <>
          {accountUrls.map((url) => (
            <AccountOption
              key={url}
              accountUrl={url}
              active={url === activeAccountUrl}
              onSelect={() => {
                updateDeckColumn(column.id, {
                  accountUrl: url === mainAccountUrl ? undefined : url,
                });
                handleClose();
              }}
            />
          ))}
        </>
      ),
    [accountUrls, activeAccountUrl, mainAccountUrl, column.id],
  );

  if (accountUrls.length < 2 || !activeAccountUrl) return null;

  return (
    <DropdownMenu
      component={Component}
      placement='bottom-end'
      width='18rem'
      title={intl.formatMessage(messages.showAsAccountTitle)}
    >
      <button
        type='button'
        className='deck__column__account-button'
        title={intl.formatMessage(messages.showAsAccount)}
        aria-label={intl.formatMessage(messages.showAsAccount)}
      >
        <CurrentAccountProvider accountUrl={activeAccountUrl}>
          <CurrentAccountAvatar />
        </CurrentAccountProvider>
      </button>
    </DropdownMenu>
  );
};

export { DeckColumnAccountButton };
