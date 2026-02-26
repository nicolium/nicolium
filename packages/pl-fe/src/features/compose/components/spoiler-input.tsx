import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import { useComposeSuggestions } from '@/hooks/use-compose-suggestions';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { InputThemes } from '@/components/ui/input';

const messages = defineMessages({
  placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Subject (optional)' },
});

interface ISpoilerInput {
  composeId: string extends 'default' ? never : string;
  theme?: InputThemes;
}

/** Text input for content warning in composer. */
const SpoilerInput: React.FC<ISpoilerInput> = ({ composeId, theme }) => {
  const intl = useIntl();
  const { selectComposeSuggestion, updateCompose } = useComposeActions();
  const { language, modifiedLanguage, spoilerText, spoilerTextMap } = useCompose(composeId);

  const [token, setToken] = useState('');
  const suggestions = useComposeSuggestions(token);

  const handleChangeSpoilerText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const text = e.target.value;
    updateCompose(composeId, (draft) => {
      if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
        draft.spoilerText = text;
      } else {
        draft.spoilerTextMap[draft.modifiedLanguage] = text;
      }
    });
  };

  const onSuggestionsFetchRequested = (token: string) => setToken(token);
  const onSuggestionsClearRequested = () => setToken('');
  const onSuggestionSelected = (
    tokenStart: number,
    token: string | null,
    value: AutoSuggestion,
  ) => {
    if (token && typeof token === 'string') {
      selectComposeSuggestion(composeId, tokenStart, token, value, ['spoiler_text']);
    }
  };

  const value =
    !modifiedLanguage || modifiedLanguage === language
      ? spoilerText
      : spoilerTextMap[modifiedLanguage] || '';

  return (
    <AutosuggestInput
      placeholder={intl.formatMessage(messages.placeholder)}
      value={value}
      onChange={handleChangeSpoilerText}
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      theme={theme}
      searchTokens={[':']}
      id='cw-spoiler-input'
      className='⁂-compose-form__spoiler-input'
      lang={modifiedLanguage ?? undefined}
    />
  );
};

export { SpoilerInput as default };
