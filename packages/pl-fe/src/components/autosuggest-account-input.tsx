import React from 'react';

import AutosuggestInput, { AutoSuggestion } from 'pl-fe/components/autosuggest-input';
import { useDebounce } from 'pl-fe/hooks/use-debounce';
import { useAccountSearch } from 'pl-fe/queries/search/use-search-accounts';

import type { Menu } from 'pl-fe/components/dropdown-menu';
import type { InputThemes } from 'pl-fe/components/ui/input';

const SEARCH_PARAMS = {
  limit: 5,
  resolve: false,
};

const noOp = () => { };

interface IAutosuggestAccountInput {
  id?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSelected: (accountId: string) => void;
  autoFocus?: boolean;
  value: string;
  className?: string;
  autoSelect?: boolean;
  menu?: Menu;
  onKeyDown?: React.KeyboardEventHandler;
  theme?: InputThemes;
  placeholder?: string;
}

const AutosuggestAccountInput: React.FC<IAutosuggestAccountInput> = ({
  onChange,
  onSelected,
  value = '',
  ...rest
}) => {
  // should ignore debounce on clearing input
  const debouncedValue = useDebounce(value, 900);
  const { data: accountIds = [] } = useAccountSearch(debouncedValue, SEARCH_PARAMS);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    onChange(e);
  };

  const handleSelected = (_tokenStart: number, _lastToken: string | null, suggestion: AutoSuggestion) => {
    if (typeof suggestion === 'string' && suggestion[0] !== '#') {
      onSelected(suggestion);
    }
  };

  return (
    <AutosuggestInput
      value={value}
      onChange={handleChange}
      suggestions={accountIds}
      onSuggestionsFetchRequested={noOp}
      onSuggestionsClearRequested={noOp}
      onSuggestionSelected={handleSelected}
      searchTokens={[]}
      {...rest}
    />
  );
};

export { AutosuggestAccountInput as default };
