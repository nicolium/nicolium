import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { length } from 'stringz';

const messages = defineMessages({
  characterCount: { id: 'compose_form.remaining_character_count', defaultMessage: 'Remaining characters: {value} of {max}' },
});

interface ITextCharacterCounter {
  max: number;
  text: string;
}

const TextCharacterCounter: React.FC<ITextCharacterCounter> = ({ text, max }) => {
  const intl = useIntl();

  const checkRemainingText = (diff: number) => (
    <span
      className={clsx('text-sm font-medium', {
        'text-gray-700': diff >= 0,
        'text-secondary-600': diff < 0,
      })}
      title={intl.formatMessage(messages.characterCount, { value: diff, max })}
    >
      {diff}
    </span>
  );

  const diff = max - length(text);
  return checkRemainingText(diff);
};

export { TextCharacterCounter as default };
