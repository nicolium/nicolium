import React from 'react';

import EmojiPickerDropdown from '@/emoji/containers/emoji-picker-dropdown-container';
import { useFeatures } from '@/hooks/use-features';
import { useEmojiReactMutation } from '@/queries/statuses/use-status-interactions';
import { useSettings } from '@/stores/settings';

import type { IActionButton } from '../types';
import type { Emoji as EmojiType } from '@/emoji';

const EmojiPickerButton: React.FC<Omit<IActionButton, 'onOpenUnauthorizedModal'>> = ({
  status,
  withLabels,
  me,
}) => {
  const features = useFeatures();
  const { demetricator } = useSettings();

  const { mutate: emojiReact } = useEmojiReactMutation(status.id);

  const handlePickEmoji = (emoji: EmojiType) => {
    emojiReact(emoji.custom ? emoji.id : emoji.native);
  };

  return (
    me &&
    (!withLabels || demetricator === 'always') &&
    features.emojiReacts && <EmojiPickerDropdown onPickEmoji={handlePickEmoji} />
  );
};

export { EmojiPickerButton };
