import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import Toggle from '@/components/ui/toggle';
import { useComposeSuggestions } from '@/hooks/use-compose-suggestions';
import { useCompose, useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';

import DurationSelector from './duration-selector';

import type { AutoSuggestion } from '@/components/autosuggest-input';

const messages = defineMessages({
  optionPlaceholder: {
    id: 'compose_form.poll.option.placeholder',
    defaultMessage: 'Answer #{number}',
  },
});

interface IOption {
  composeId: string;
  index: number;
  maxChars: number;
  numOptions: number;
  onChange(index: number, value: string): void;
  onRemove(index: number): void;
  onRemovePoll(): void;
  title: string;
}

const Option: React.FC<IOption> = ({
  composeId,
  index,
  maxChars,
  numOptions,
  onChange,
  onRemove,
  onRemovePoll,
  title,
}) => {
  const { selectComposeSuggestion } = useComposeActions();
  const intl = useIntl();

  const [token, setToken] = useState('');
  const suggestions = useComposeSuggestions(token);
  const { modifiedLanguage: language } = useCompose(composeId);

  const handleOptionTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, event.target.value);
  };

  const handleOptionRemove = () => {
    if (numOptions > 2) {
      onRemove(index);
    } else {
      onRemovePoll();
    }
  };

  const onSuggestionsClearRequested = () => setToken('');

  const onSuggestionsFetchRequested = (token: string) => {
    setToken(token);
  };

  const onSuggestionSelected = (
    tokenStart: number,
    token: string | null,
    value: AutoSuggestion,
  ) => {
    if (token && typeof token === 'string') {
      selectComposeSuggestion(composeId, tokenStart, token, value, ['poll', 'options', index]);
    }
  };

  return (
    <div className='compose-form__poll__option'>
      <div className='compose-form__poll__option__input'>
        <span className='compose-form__poll__option__index'>{index + 1}.</span>

        <AutosuggestInput
          className='compose-form__poll__option__field'
          placeholder={intl.formatMessage(messages.optionPlaceholder, { number: index + 1 })}
          maxLength={maxChars}
          value={title}
          onChange={handleOptionTitleChange}
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          searchTokens={[':']}
          autoFocus={index === 0 || index >= 2}
          lang={language ?? undefined}
        />
      </div>

      {index > 1 && (
        <button
          type='button'
          className='compose-form__poll__option__remove'
          onClick={handleOptionRemove}
        >
          <FormattedMessage
            id='compose_form.poll.remove_option'
            defaultMessage='Remove this answer'
          />
        </button>
      )}
    </div>
  );
};

interface IPollForm {
  composeId: string;
}

const PollForm: React.FC<IPollForm> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const { configuration } = useInstance();

  const { poll, language, modifiedLanguage } = useCompose(composeId);

  const options =
    !modifiedLanguage || modifiedLanguage === language
      ? poll?.options
      : poll?.options_map.map((option, key) => option[modifiedLanguage] || poll.options[key]);
  const expiresIn = poll?.expires_in;
  const isMultiple = poll?.multiple;

  const { max_options: maxOptions, max_characters_per_option: maxOptionChars } =
    configuration.polls;

  const onRemoveOption = (index: number) =>
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      draft.poll.options = draft.poll.options.filter((_, i) => i !== index);
      draft.poll.options_map = draft.poll.options_map.filter((_, i) => i !== index);
    });
  const onChangeOption = (index: number, title: string) =>
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
        draft.poll.options[index] = title;
        if (draft.modifiedLanguage) draft.poll.options_map[index][draft.modifiedLanguage] = title;
      }
    });
  const handleAddOption = () =>
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      draft.poll.options.push('');
      draft.poll.options_map.push(
        Object.fromEntries(Object.entries(draft.textMap).map((key) => [key, ''])),
      );
    });
  const handleSelectDuration = (value: number) =>
    updateCompose(composeId, (draft) => {
      if (draft.poll) draft.poll.expires_in = value;
    });
  const handleToggleMultiple = () =>
    updateCompose(composeId, (draft) => {
      if (draft.poll) draft.poll.multiple = !draft.poll.multiple;
    });
  const onRemovePoll = () =>
    updateCompose(composeId, (draft) => {
      draft.poll = null;
    });

  if (!options) {
    return null;
  }

  return (
    <div className='compose-form__poll'>
      <div className='compose-form__poll__options'>
        {options.map((title: string, i: number) => (
          <Option
            composeId={composeId}
            title={title}
            key={i}
            index={i}
            onChange={onChangeOption}
            onRemove={onRemoveOption}
            maxChars={maxOptionChars}
            numOptions={options.length}
            onRemovePoll={onRemovePoll}
          />
        ))}

        <div className='compose-form__poll__add'>
          <div className='compose-form__poll__add__padding' />

          {options.length < maxOptions && (
            <button type='button' onClick={handleAddOption}>
              <FormattedMessage id='compose_form.poll.add_option' defaultMessage='Add an answer' />
            </button>
          )}
        </div>
      </div>

      <div className='divider' data-testid='divider'>
        <div aria-hidden='true'>
          <div />
        </div>
      </div>

      <label className='compose-form__poll__toggle'>
        <div className='compose-form__poll__toggle__info'>
          <span className='compose-form__poll__toggle__title'>
            <FormattedMessage id='compose_form.poll.multiselect' defaultMessage='Multi-select' />
          </span>

          <span className='compose-form__poll__toggle__description'>
            <FormattedMessage
              id='compose_form.poll.multiselect_detail'
              defaultMessage='Allow users to select multiple answers'
            />
          </span>
        </div>

        <Toggle checked={isMultiple} onChange={handleToggleMultiple} />
      </label>

      <div className='divider' data-testid='divider'>
        <div aria-hidden='true'>
          <div />
        </div>
      </div>

      <div className='compose-form__poll__duration'>
        <span className='compose-form__poll__duration__label'>
          <FormattedMessage id='compose_form.poll.duration' defaultMessage='Poll duration' />
        </span>

        <DurationSelector
          onDurationChange={handleSelectDuration}
          value={expiresIn ?? 2 * 24 * 60 * 60}
        />
      </div>

      <div className='compose-form__poll__remove'>
        <button type='button' onClick={onRemovePoll}>
          <FormattedMessage id='compose_form.poll.remove' defaultMessage='Remove poll' />
        </button>
      </div>
    </div>
  );
};

export { PollForm as default };
