import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import AccountComponent from 'pl-fe/components/account';
import Icon from 'pl-fe/components/icon';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSearchAccounts } from 'pl-fe/queries/search/use-search';
import { useAccountAliases, useAddAccountAlias, useDeleteAccountAlias } from 'pl-fe/queries/settings/use-account-aliases';

const messages = defineMessages({
  heading: { id: 'column.aliases', defaultMessage: 'Account aliases' },
  subheading_add_new: { id: 'column.aliases.subheading_add_new', defaultMessage: 'Add new alias' },
  create_error: { id: 'column.aliases.create_error', defaultMessage: 'Error creating alias' },
  delete_error: { id: 'column.aliases.delete_error', defaultMessage: 'Error deleting alias' },
  subheading_aliases: { id: 'column.aliases.subheading_aliases', defaultMessage: 'Current aliases' },
  delete: { id: 'column.aliases.delete', defaultMessage: 'Delete' },
  add: { id: 'aliases.account.add', defaultMessage: 'Create alias' },
  search: { id: 'aliases.search', defaultMessage: 'Search your old account' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
});

interface IAccount {
  accountId: string;
  aliases: string[];
}

const Account: React.FC<IAccount> = ({ accountId, aliases }) => {
  const intl = useIntl();
  const features = useFeatures();

  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(accountId);

  const { mutate: addAccountAlias } = useAddAccountAlias();

  const apId = account?.ap_id;
  const name = features.accountMoving ? account?.acct : apId;
  const added = name ? aliases.includes(name) : false;

  const handleOnAdd = () => addAccountAlias(name!);

  if (!account) return null;

  let button;

  if (!added && accountId !== me) {
    button = (
      <IconButton src={require('@phosphor-icons/core/regular/plus.svg')} className='text-gray-400 hover:text-gray-600' iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={handleOnAdd} />
    );
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountComponent account={account} withRelationship={false} />
      </div>
      {button}
    </HStack>
  );
};

interface IAliasesSearch {
  onSubmit: (value: string) => void;
}

const Search: React.FC<IAliasesSearch> = ({ onSubmit }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <div className='flex items-center gap-1'>
      <label className='relative grow'>
        <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

        <input
          className='block w-full rounded-full focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 sm:text-sm'
          type='text'
          value={value}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder={intl.formatMessage(messages.search)}
        />

        <button
          disabled={!hasValue}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
          title={intl.formatMessage(messages.clear)}
        >
          <Icon src={require('@phosphor-icons/core/regular/backspace.svg')} className={clsx('size-5 text-gray-600', { 'hidden': !hasValue })} />
        </button>
      </label>
      <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
    </div>
  );
};

const AliasesPage = () => {
  const intl = useIntl();

  const [query, setQuery] = useState('');

  const { data: aliases = [] } = useAccountAliases();
  const { data: searchAccountIds = [], isFetched } = useSearchAccounts(query);
  const { mutate: deleteAccountAlias } = useDeleteAccountAlias();

  const handleAliasDelete: React.MouseEventHandler<HTMLButtonElement> = e => {
    deleteAccountAlias(e.currentTarget.dataset.value as string);
  };

  const emptyMessage = <FormattedMessage id='empty_column.aliases' defaultMessage="You haven't created any account alias yet." />;

  return (
    <Column className='flex-1' label={intl.formatMessage(messages.heading)}>
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_add_new)} />
      </CardHeader>
      <Search onSubmit={setQuery} />
      {
        isFetched && searchAccountIds.length === 0 ? (
          <div className='empty-column-indicator'>
            <FormattedMessage id='empty_column.aliases.suggestions' defaultMessage='There are no account suggestions available for the provided term.' />
          </div>
        ) : (
          <div className='mb-4 max-h-72 overflow-y-auto'>
            {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} aliases={aliases} />)}
          </div>
        )
      }
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_aliases)} />
      </CardHeader>
      <div className='flex-1'>
        <ScrollableList
          scrollKey='aliases'
          emptyMessageText={emptyMessage}
        >
          {aliases.map((alias, i) => (
            <HStack alignItems='center' justifyContent='between' space={1} key={i} className='p-2'>
              <div>
                <Text tag='span' theme='muted'><FormattedMessage id='aliases.account_label' defaultMessage='Old account:' /></Text>
                {' '}
                <Text tag='span'>{alias}</Text>
              </div>
              <button onClick={handleAliasDelete} data-value={alias} aria-label={intl.formatMessage(messages.delete)}>
                <Text theme='muted' className='flex items-center gap-1'>
                  <Icon src={require('@phosphor-icons/core/regular/x.svg')} />
                  <FormattedMessage id='aliases.aliases_list_delete' defaultMessage='Unlink alias' />
                </Text>
              </button>
            </HStack>
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { AliasesPage as default };
