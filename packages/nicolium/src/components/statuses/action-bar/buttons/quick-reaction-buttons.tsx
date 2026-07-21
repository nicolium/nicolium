import clsx from 'clsx';
import React from 'react';
import { useIntl } from 'react-intl';

import Emoji from '@/components/ui/emoji';
import unicodeMapping from '@/emoji/mapping';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import {
  useEmojiReactMutation,
  useEmojiUnreactMutation,
} from '@/queries/statuses/use-status-interactions';
import { useSettings } from '@/stores/settings';

import messages from '../messages';

import type { IActionButton } from '../types';
import type { SelectedStatus } from '@/queries/statuses/use-status';

interface IQuickReactionButton {
  status: SelectedStatus;
  name: string;
}

const QuickReactionButton: React.FC<IQuickReactionButton> = ({ status, name }) => {
  const intl = useIntl();
  const { mutate: emojiReact } = useEmojiReactMutation(status.id);
  const { mutate: emojiUnreact } = useEmojiUnreactMutation(status.id);

  const custom = !unicodeMapping[name];
  const { data: customEmoji } = useCustomEmojis((emojis) =>
    emojis.find(({ shortcode }) => shortcode === name),
  );

  if (custom && !customEmoji) return null;

  const reaction = status.emoji_reactions.find((emoji) => emoji.name === name);

  const handleClick: React.EventHandler<React.MouseEvent> = () => {
    if (reaction?.me) {
      emojiUnreact(name);
    } else {
      emojiReact(name);
    }
  };

  return (
    <button
      type='button'
      className={clsx('status-action-bar__button', 'status-action-bar__button--quick-reaction', {
        'status-action-bar__button--active': reaction?.me,
      })}
      title={intl.formatMessage(messages.quickReaction, { emoji: custom ? `:${name}:` : name })}
      onClick={handleClick}
    >
      <Emoji emoji={custom ? undefined : name} src={customEmoji?.url} />
    </button>
  );
};

const QuickReactionButtons: React.FC<Omit<IActionButton, 'onOpenUnauthorizedModal'>> = ({
  status,
  withLabels,
  me,
}) => {
  const { quickReactionEmojis } = useSettings();

  if (!me || withLabels || !quickReactionEmojis.length) return null;

  return (
    <>
      {quickReactionEmojis.map((name) => (
        <QuickReactionButton key={name} status={status} name={name} />
      ))}
    </>
  );
};

export { QuickReactionButtons };
