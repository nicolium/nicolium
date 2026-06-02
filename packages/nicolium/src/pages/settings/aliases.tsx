import iconBackspace from '@phosphor-icons/core/regular/backspace.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountComponent from '@/components/accounts/account';
import Icon from '@/components/icon';
import ScrollableList from '@/components/scrollable-list';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import { useSearchAccounts } from '@/queries/search/use-search';
import {
  useAccountAliases,
  useAddAccountAlias,
  useDeleteAccountAlias,
} from '@/queries/settings/use-account-aliases';

const messages = defineMessages({
  heading: { id: 'column.aliases', defaultMessage: 'Account aliases' },
  delete: { id: 'column.aliases.delete', defaultMessage: 'Delete' },
  add: { id: 'aliases.account.add', defaultMessage: 'Create alias' },
  search: { id: 'aliases.search', defaultMessage: 'Search your old account' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
});

interface IAccount {
  accountId: string;
  aliases: string[];
}

const Account: React.FC<IAccount> = ({ accountId, aliases }) => {
  const intl = useIntl();
  const features = useFeatures();

  const me = useCurrentAccount();
  const { data: account } = useAccount(accountId);

  const { mutate: addAccountAlias } = useAddAccountAlias();

  const apId = account?.ap_id;
  const name = features.accountMoving ? account?.acct : apId;
  const added = name ? aliases.includes(name) : false;

  const handleOnAdd = () => {
    addAccountAlias(name!);
  };

  if (!account) return null;

  return (
    <div className='aliases__account__container'>
      <div className='aliases__account'>
        <AccountComponent account={account} withRelationship={false} />
      </div>
      {!added && accountId !== me && (
        <IconButton src={iconPlus} title={intl.formatMessage(messages.add)} onClick={handleOnAdd} />
      )}
    </div>
  );
};

interface IAliasesSearch {
  onSubmit: (value: string) => void;
}

const Search: React.FC<IAliasesSearch> = ({ onSubmit }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.keyCode === 13) {
      onSubmit(value);
    }
  };

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handleClear = () => {
    setValue('');
    onSubmit('');
  };

  const hasValue = value.length > 0;

  return (
    <div className='aliases__search'>
      <label title={intl.formatMessage(messages.search)}>
        <input
          type='text'
          value={value}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder={intl.formatMessage(messages.search)}
        />

        <button
          disabled={!hasValue}
          className='aliases__search__clear'
          onClick={handleClear}
          title={intl.formatMessage(messages.clear)}
        >
          <Icon src={iconBackspace} aria-hidden />
        </button>
      </label>
      <button onClick={handleSubmit}>
        <FormattedMessage id='tabs_bar.search' defaultMessage='Search' />
      </button>
    </div>
  );
};

const AliasesPage = () => {
  const intl = useIntl();

  const [query, setQuery] = useState('');

  const { data: aliases = [] } = useAccountAliases();
  const { data: searchAccountIds = [], isFetched } = useSearchAccounts(query);
  const { mutate: deleteAccountAlias } = useDeleteAccountAlias();

  const handleAliasDelete: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    deleteAccountAlias(e.currentTarget.dataset.value as string);
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.aliases'
      defaultMessage='You haven’t created any account aliases yet.'
    />
  );

  return (
    <Column className='flex-1' label={intl.formatMessage(messages.heading)}>
      <CardHeader>
        <CardTitle
          title={
            <FormattedMessage
              id='column.aliases.subheading_add_new'
              defaultMessage='Add new alias'
            />
          }
        />
      </CardHeader>
      <Search onSubmit={setQuery} />
      {isFetched && searchAccountIds.length === 0 ? (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.aliases.suggestions'
            defaultMessage='There are no account suggestions available for the provided term.'
          />
        </div>
      ) : (
        <div className='aliases__search-results'>
          {searchAccountIds.map((accountId) => (
            <Account key={accountId} accountId={accountId} aliases={aliases} />
          ))}
        </div>
      )}
      <CardHeader>
        <CardTitle
          title={
            <FormattedMessage
              id='column.aliases.subheading_aliases'
              defaultMessage='Current aliases'
            />
          }
        />
      </CardHeader>
      <div className='flex-1'>
        <ScrollableList scrollKey='aliases' emptyMessageText={emptyMessage}>
          {aliases.map((alias) => (
            <div key={alias} className='aliases__alias'>
              <div>
                <span>
                  <FormattedMessage id='aliases.account.label' defaultMessage='Old account:' />
                </span>{' '}
                <span>{alias}</span>
              </div>
              <button
                onClick={handleAliasDelete}
                data-value={alias}
                aria-label={intl.formatMessage(messages.delete)}
                className='aliases__delete'
              >
                <Icon src={iconX} />
                <FormattedMessage id='aliases.aliases_list_delete' defaultMessage='Unlink alias' />
              </button>
            </div>
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { AliasesPage as default };
