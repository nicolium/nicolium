import iconSmileySticker from '@phosphor-icons/core/regular/smiley-sticker.svg';
import { useTransition } from '@react-spring/web';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import EmojiPickerDropdown from '@/features/emoji/containers/emoji-picker-dropdown-container';
import { useAnnouncements } from '@/queries/announcements/use-announcements';
import { useSettings } from '@/stores/settings';

import Icon from '../ui/icon';

import Reaction from './reaction';

import type { Emoji, NativeEmoji } from '@/features/emoji';
import type { AnnouncementReaction, CustomEmoji } from 'pl-api';

const messages = defineMessages({
  addEmoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IReactionsBar {
  announcementId: string;
  reactions: Array<AnnouncementReaction>;
  emojiMap: Record<string, CustomEmoji>;
}

const ReactionsBar: React.FC<IReactionsBar> = ({ announcementId, reactions, emojiMap }) => {
  const intl = useIntl();
  const { reduceMotion } = useSettings();
  const { addReaction } = useAnnouncements();

  const handleEmojiPick = (data: Emoji) => {
    addReaction({ announcementId, name: (data as NativeEmoji).native.replaceAll(':', '') });
  };

  const visibleReactions = reactions.filter((x) => x.count > 0);

  const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    immediate: reduceMotion,
    keys: visibleReactions.map((x) => x.name),
  });

  return (
    <div className='status-reactions-bar'>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.name}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          announcementId={announcementId}
          emojiMap={emojiMap}
        />
      ))}

      {visibleReactions.length < 8 && (
        <EmojiPickerDropdown onPickEmoji={handleEmojiPick}>
          <button
            className='status-reactions-bar__picker-button'
            title={intl.formatMessage(messages.addEmoji)}
          >
            <Icon src={iconSmileySticker} aria-hidden />
          </button>
        </EmojiPickerDropdown>
      )}
    </div>
  );
};

export { ReactionsBar as default };
