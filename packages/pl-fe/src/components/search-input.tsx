import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestAccountInput from '@/components/autosuggest-account-input';
import SvgIcon from '@/components/ui/svg-icon';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { selectAccount } from '@/selectors';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

const SearchInput = React.memo(() => {
  const [value, setValue] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const intl = useIntl();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    setValue('');
  };

  const handleSubmit = () => {
    setValue('');
    const guessedType = /^(?:\/statuses\/|\/notice\/|\/objects\/|\/@[\w.-]+\/\d+)/.test(value)
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
    dispatch((_, getState) =>
      navigate({
        to: '/@{$username}',
        params: { username: selectAccount(getState(), accountId)!.acct },
      }),
    );
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: require('@phosphor-icons/core/regular/magnifying-glass.svg'),
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
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
          title={
            hasValue ? intl.formatMessage(messages.clear) : intl.formatMessage(messages.placeholder)
          }
        >
          <SvgIcon
            src={require('@phosphor-icons/core/regular/magnifying-glass.svg')}
            className={clsx('size-4 text-gray-600', { hidden: hasValue })}
            aria-hidden
          />

          <SvgIcon
            src={require('@phosphor-icons/core/regular/x.svg')}
            className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
});

export { SearchInput as default };
