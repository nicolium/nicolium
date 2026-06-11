import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
});

interface ISearchInput {
  className?: string;
  placeholder?: string;
  query?: string;
  setQuery: (value: string) => void;
}

const SearchInput: React.FC<ISearchInput> = ({ className, placeholder, query, setQuery }) => {
  const [value, setValue] = useState(query ?? '');

  const intl = useIntl();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (query === value) {
      if (value.length > 0) {
        setValue('');
        setQuery('');
      }
    } else {
      setQuery(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      setQuery(value);
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  return (
    <div className={clsx('search-input', className)}>
      <div>
        <Input
          type='text'
          id='search'
          placeholder={placeholder ?? intl.formatMessage(messages.placeholder)}
          aria-label={placeholder ?? intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          theme='search'
        />

        <button
          tabIndex={value ? 0 : -1}
          onClick={handleClick}
          title={
            query === value
              ? intl.formatMessage(messages.clear)
              : intl.formatMessage(messages.placeholder)
          }
        >
          {query === value ? <Icon src={iconX} /> : <Icon src={iconMagnifyingGlass} />}
        </button>
      </div>
    </div>
  );
};

export { SearchInput };
