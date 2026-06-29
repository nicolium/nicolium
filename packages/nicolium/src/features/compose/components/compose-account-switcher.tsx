import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import PlaceholderAvatar from '@/components/placeholders/placeholder-avatar';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useAuthStore } from '@/stores/auth';
import { useComposeActions } from '@/stores/compose';

const messages = defineMessages({
  title: {
    id: 'compose.account_switcher.title',
    defaultMessage: 'Choose the account to post from',
  },
});

const SwitcherAccount: React.FC = () => {
  const { data: account } = useOwnAccount();

  if (!account) return <PlaceholderAvatar size={32} />;

  return (
    <Avatar
      src={account?.avatar_static ?? account?.avatar ?? ''}
      size={32}
      username={account?.acct}
      isCat={account?.is_cat}
    />
  );
};

interface IComposeAccountSwitcher {
  composeId: string;
}

const ComposeAccountSwitcher: React.FC<IComposeAccountSwitcher> = ({ composeId }) => {
  const intl = useIntl();
  const scopeUrl = useScopeUrl();
  const users = useAuthStore((state) => state.users);
  const { data: account } = useOwnAccount();
  const { switchAccount } = useComposeActions();

  const [switching, setSwitching] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const accountUrls = useMemo(() => Object.keys(users).filter((url) => users[url].id), [users]);

  const handleSwitch = async (targetUrl: string) => {
    if (targetUrl === scopeUrl) return;

    setSwitching(true);

    await switchAccount(composeId, scopeUrl, targetUrl);

    setSwitching(false);
  };

  const handleToggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  if (accountUrls.length < 2) return null;

  const button = (
    <button
      className='compose-account-switcher'
      onClick={handleToggleExpanded}
      type='button'
      aria-expanded={expanded}
      aria-label={intl.formatMessage(messages.title)}
    >
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Posting as {account}'
        values={{
          account: account ? `@${account.fqn}` : '',
        }}
      />
      <Icon src={iconCaretDown} aria-hidden />
    </button>
  );

  if (expanded)
    return (
      <>
        {button}
        <div className='compose-account-switcher__accounts'>
          {accountUrls.map((accountUrl) => (
            <CurrentAccountProvider key={accountUrl} accountUrl={accountUrl}>
              <button
                type='button'
                className='compose-account-switcher__account'
                onClick={() => {
                  handleSwitch(accountUrl);
                }}
                aria-pressed={accountUrl === scopeUrl}
                disabled={switching}
              >
                <SwitcherAccount />
              </button>
            </CurrentAccountProvider>
          ))}
        </div>
      </>
    );

  return button;
};

export { ComposeAccountSwitcher as default };
