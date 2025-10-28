import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerText } from 'pl-fe/actions/compose';
import AutosuggestInput, { IAutosuggestInput } from 'pl-fe/components/autosuggest-input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

const messages = defineMessages({
  placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Subject (optional)' },
});

interface ISpoilerInput extends Pick<IAutosuggestInput, 'onSuggestionsFetchRequested' | 'onSuggestionsClearRequested' | 'onSuggestionSelected' | 'theme'> {
  composeId: string extends 'default' ? never : string;
}

/** Text input for content warning in composer. */
const SpoilerInput: React.FC<ISpoilerInput> = ({
  composeId,
  onSuggestionsFetchRequested,
  onSuggestionsClearRequested,
  onSuggestionSelected,
  theme,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { language, modifiedLanguage, spoilerText, spoilerTextMap, suggestions } = useCompose(composeId);

  const handleChangeSpoilerText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeComposeSpoilerText(composeId, e.target.value));
  };

  const value = !modifiedLanguage || modifiedLanguage === language ? spoilerText : spoilerTextMap[modifiedLanguage] || '';

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
      lang={modifiedLanguage || undefined}
    />
  );
};

export { SpoilerInput as default };
