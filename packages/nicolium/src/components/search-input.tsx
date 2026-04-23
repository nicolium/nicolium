import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestAccountInput from '@/components/autosuggest-account-input';
import SvgIcon from '@/components/ui/svg-icon';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

const SearchInput = React.memo(() => {
  const [value, setValue] = useState('');

  const navigate = useNavigate();
  const intl = useIntl();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClear = () => {
    setValue('');
  };

  const handleSubmit = () => {
    setValue('');
    const guessedType = /(?:\/statuses\/|\/notice\/|\/objects\/|\/@[\w.-]+\/\d+)/.test(value)
      ? 'statuses'
      : 'accounts';
    navigate({ to: '/search', search: { q: value, type: guessedType } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleSubmit();
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const handleSelected = (accountId: string) => {
    setValue('');
    const account = queryClient.getQueryData(queryKeys.accounts.show(accountId));
    if (account) {
      navigate({
        to: '/@{$username}',
        params: { username: account.acct },
      });
    }
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: iconMagnifyingGlass,
      action: handleSubmit,
    },
  ];

  const hasValue = value.length > 0;

  return (
    <div className='w-full'>
      <div className='relative'>
        <AutosuggestAccountInput
          id='search'
          placeholder={intl.formatMessage(messages.placeholder)}
          aria-label={intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelected={handleSelected}
          menu={makeMenu()}
          autoSelect={false}
          theme='search'
          className='pr-10 rtl:pl-10 rtl:pr-3'
        />

        <button
          tabIndex={hasValue ? 0 : -1}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
          title={
            hasValue ? intl.formatMessage(messages.clear) : intl.formatMessage(messages.placeholder)
          }
        >
          <SvgIcon
            src={iconMagnifyingGlass}
            className={clsx('size-4 text-gray-600', { hidden: hasValue })}
            aria-hidden
          />

          <SvgIcon
            src={iconX}
            className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export { SearchInput as default };
