import iconBackspace from '@phosphor-icons/core/regular/backspace.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import { useDebounce } from '@uidotdev/usehooks';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput, { type AutoSuggestion } from '@/components/autosuggest-input';
import Icon from '@/components/icon';
import { useSearchLocation } from '@/queries/search/use-search-location';

import type { Location } from 'pl-api';

const noOp = () => {};

const messages = defineMessages({
  placeholder: { id: 'location_search.placeholder', defaultMessage: 'Find an address' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
});

interface ILocationSearch {
  id?: string;
  onSelected: (location: Location) => void;
}

const LocationSearch: React.FC<ILocationSearch> = ({ id, onSelected }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 400);
  const locationsQuery = useSearchLocation(debouncedValue);

  const empty = !(value.length > 0);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setValue(target.value);
  };

  const handleSelected = (
    _tokenStart: number,
    _lastToken: string | null,
    suggestion: AutoSuggestion,
  ) => {
    if (typeof suggestion === 'object' && 'origin_id' in suggestion) {
      onSelected(suggestion);
    }
  };

  const handleClear: React.MouseEventHandler = (e) => {
    e.preventDefault();

    if (!empty) {
      setValue('');
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  return (
    <div className='relative'>
      <AutosuggestInput
        id={id}
        className='rounded-full'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value}
        onChange={handleChange}
        suggestions={locationsQuery.data ?? []}
        onSuggestionsFetchRequested={noOp}
        onSuggestionsClearRequested={noOp}
        onSuggestionSelected={handleSelected}
        searchTokens={[]}
        onKeyDown={handleKeyDown}
      />
      <button
        disabled={empty}
        tabIndex={0}
        className='absolute inset-y-0 right-0 flex items-center px-3 rtl:left-0 rtl:right-auto'
        onClick={handleClear}
        title={intl.formatMessage(messages.clear)}
      >
        <Icon
          src={iconMagnifyingGlass}
          className={clsx('size-5 text-gray-600', { hidden: !empty })}
        />
        <Icon src={iconBackspace} className={clsx('size-5 text-gray-600', { hidden: empty })} />
      </button>
    </div>
  );
};

export { LocationSearch as default };
