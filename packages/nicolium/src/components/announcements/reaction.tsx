import { animated, type AnimatedProps } from '@react-spring/web';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AnimatedNumber from '@/components/animated-number';
import unicodeMapping from '@/features/emoji/mapping';
import { useAnnouncements } from '@/queries/announcements/use-announcements';

import Emoji from './emoji';

import type { AnnouncementReaction, CustomEmoji } from 'pl-api';

const messages = defineMessages({
  emojiCount: {
    id: 'status.reactions.label',
    defaultMessage: '{count} {count, plural, one {person} other {people}} reacted with {emoji}',
  },
});

interface IReaction {
  announcementId: string;
  reaction: AnnouncementReaction;
  emojiMap: Record<string, CustomEmoji>;
  style: AnimatedProps<React.ComponentProps<'button'>>['style'];
}

const Reaction: React.FC<IReaction> = ({ announcementId, reaction, emojiMap, style }) => {
  const intl = useIntl();
  const [hovered, setHovered] = useState(false);

  const { addReaction, removeReaction } = useAnnouncements();

  const handleClick = () => {
    if (reaction.me) {
      removeReaction({ announcementId, name: reaction.name });
    } else {
      addReaction({ announcementId, name: reaction.name });
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  let shortCode = reaction.name;

  if (unicodeMapping[shortCode]) {
    shortCode = unicodeMapping[shortCode].shortcode;
  }

  return (
    <animated.button
      className={clsx('⁂-status-reactions-bar__button', {
        '⁂-status-reactions-bar__button--active': reaction.me,
      })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={intl.formatMessage(messages.emojiCount, {
        emoji: `:${shortCode}:`,
        count: reaction.count,
      })}
      style={style}
    >
      <Emoji hovered={hovered} emoji={reaction.name} emojiMap={emojiMap} />

      <p>
        <AnimatedNumber value={reaction.count} />
      </p>
    </animated.button>
  );
};

export { Reaction as default };
