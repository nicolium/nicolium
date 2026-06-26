import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestAccountInput from '@/components/autosuggest-account-input';
import SvgIcon from '@/components/ui/svg-icon';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

const SearchInput = React.memo(() => {
  const [value, setValue] = useState('');

  const navigate = useNavigate();
  const intl = useIntl();
  const scopeUrl = useScopeUrl();

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
    const account = queryClient.getQueryData(
      scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
    );
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
    <div className='search-input'>
      <div className='search-input__content'>
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
        />

        <button
          tabIndex={hasValue ? 0 : -1}
          onClick={handleClear}
          title={
            hasValue ? intl.formatMessage(messages.clear) : intl.formatMessage(messages.placeholder)
          }
        >
          {hasValue ? (
            <SvgIcon src={iconX} aria-hidden />
          ) : (
            <SvgIcon src={iconMagnifyingGlass} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export { SearchInput as default };
