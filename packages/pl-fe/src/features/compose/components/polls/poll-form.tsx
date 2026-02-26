import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import Button from '@/components/ui/button';
import Divider from '@/components/ui/divider';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import { useComposeSuggestions } from '@/hooks/use-compose-suggestions';
import { useInstance } from '@/hooks/use-instance';
import { useCompose, useComposeActions } from '@/stores/compose';

import DurationSelector from './duration-selector';

import type { AutoSuggestion } from '@/components/autosuggest-input';

const messages = defineMessages({
  optionPlaceholder: {
    id: 'compose_form.poll.option_placeholder',
    defaultMessage: 'Answer #{number}',
  },
  pollDuration: { id: 'compose_form.poll.duration', defaultMessage: 'Poll duration' },
  removePoll: { id: 'compose_form.poll.remove', defaultMessage: 'Remove poll' },
  switchToMultiple: {
    id: 'compose_form.poll.switch_to_multiple',
    defaultMessage: 'Change poll to allow multiple answers',
  },
  switchToSingle: {
    id: 'compose_form.poll.switch_to_single',
    defaultMessage: 'Change poll to allow for a single answer',
  },
  multiSelect: { id: 'compose_form.poll.multiselect', defaultMessage: 'Multi-select' },
  multiSelectDetail: {
    id: 'compose_form.poll.multiselect_detail',
    defaultMessage: 'Allow users to select multiple answers',
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
    <div className='⁂-compose-form__poll__option'>
      <HStack alignItems='center' space={2} grow>
        <div className='w-6'>
          <Text weight='bold'>{index + 1}.</Text>
        </div>

        <AutosuggestInput
          className='rounded-md !bg-transparent dark:!bg-transparent'
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
      </HStack>

      {index > 1 && (
        <div>
          <Button theme='danger' size='sm' onClick={handleOptionRemove}>
            <FormattedMessage
              id='compose_form.poll.remove_option'
              defaultMessage='Remove this answer'
            />
          </Button>
        </div>
      )}
    </div>
  );
};

interface IPollForm {
  composeId: string;
}

const PollForm: React.FC<IPollForm> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const intl = useIntl();
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
    <div className='⁂-compose-form__poll'>
      <div className='⁂-compose-form__poll__options'>
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

        <HStack space={2}>
          <div className='w-6' />

          {options.length < maxOptions && (
            <Button theme='secondary' onClick={handleAddOption} size='sm' block>
              <FormattedMessage id='compose_form.poll.add_option' defaultMessage='Add an answer' />
            </Button>
          )}
        </HStack>
      </div>

      <Divider />

      <label className='text-start'>
        <HStack alignItems='center' justifyContent='between'>
          <Stack>
            <Text weight='medium'>{intl.formatMessage(messages.multiSelect)}</Text>

            <Text theme='muted' size='sm'>
              {intl.formatMessage(messages.multiSelectDetail)}
            </Text>
          </Stack>

          <Toggle checked={isMultiple} onChange={handleToggleMultiple} />
        </HStack>
      </label>

      <Divider />

      {/* Duration */}
      <Stack space={2}>
        <Text weight='medium'>{intl.formatMessage(messages.pollDuration)}</Text>

        <DurationSelector
          onDurationChange={handleSelectDuration}
          value={expiresIn ?? 2 * 24 * 60 * 60}
        />
      </Stack>

      {/* Remove Poll */}
      <div className='text-center'>
        <button type='button' className='text-danger-500' onClick={onRemovePoll}>
          {intl.formatMessage(messages.removePoll)}
        </button>
      </div>
    </div>
  );
};

export { PollForm as default };
