import { useTransition } from '@react-spring/web';
import React from 'react';

import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import { useAnnouncements } from 'pl-fe/queries/announcements/use-announcements';
import { useSettings } from 'pl-fe/stores/settings';

import Reaction from './reaction';

import type { AnnouncementReaction, CustomEmoji } from 'pl-api';
import type { Emoji, NativeEmoji } from 'pl-fe/features/emoji';

interface IReactionsBar {
  announcementId: string;
  reactions: Array<AnnouncementReaction>;
  emojiMap: Record<string, CustomEmoji>;
}

const ReactionsBar: React.FC<IReactionsBar> = ({ announcementId, reactions, emojiMap }) => {
  const { reduceMotion } = useSettings();
  const { addReaction } = useAnnouncements();

  const handleEmojiPick = (data: Emoji) => {
    addReaction({ announcementId, name: (data as NativeEmoji).native.replace(/:/g, '') });
  };

  const visibleReactions = reactions.filter(x => x.count > 0);

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
    keys: visibleReactions.map(x => x.name),
  });

  return (
    <div className='flex flex-wrap items-center gap-1'>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.name}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          announcementId={announcementId}
          emojiMap={emojiMap}
        />
      ))}

      {visibleReactions.length < 8 && <EmojiPickerDropdown onPickEmoji={handleEmojiPick} />}
    </div>
  );
};

export { ReactionsBar as default };
