import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { emojiReact, unEmojiReact } from '@/actions/emoji-reacts';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import EmojiPickerDropdown from '@/features/emoji/containers/emoji-picker-dropdown-container';
import unicodeMapping from '@/features/emoji/mapping';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useLongPress } from '@/hooks/use-long-press';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import AnimatedNumber from './animated-number';

import type { Emoji as EmojiType } from '@/features/emoji';
import type { SelectedStatus } from '@/selectors';
import type { EmojiReaction } from 'pl-api';

const messages = defineMessages({
  emojiCount: { id: 'status.reactions.label', defaultMessage: '{count} {count, plural, one {person} other {people}} reacted with {emoji}' },
  addEmoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IStatusReactionsBar {
  status: Pick<SelectedStatus, 'id' | 'emoji_reactions'>;
  collapsed?: boolean;
}

interface IStatusReaction {
  statusId: string;
  reaction: EmojiReaction;
  obfuscate?: boolean;
  unauthenticated?: boolean;
}

const StatusReaction: React.FC<IStatusReaction> = ({ reaction, statusId, obfuscate, unauthenticated }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const { openModal } = useModalsActions();

  const bind = useLongPress((e) => {
    if (!features.emojiReactsList || e.type !== 'touchstart') return;

    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    openModal('REACTIONS', { statusId: statusId, reaction: reaction.name });
  });

  if (!reaction.count) return null;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (unauthenticated) {
      if (!features.emojiReactsList) return;
      openModal('REACTIONS', { statusId, reaction: reaction.name });
    } else if (reaction.me) {
      dispatch(unEmojiReact(statusId, reaction.name));
    } else {
      dispatch(emojiReact(statusId, reaction.name, reaction.url, intl));
    }
  };

  let shortCode = reaction.name;

  // @ts-ignore
  if (unicodeMapping[shortCode]?.shortcode) {
    // @ts-ignore
    shortCode = unicodeMapping[shortCode].shortcode;
  }

  return (
    <button
      className={clsx('⁂-status-reactions-bar__button', {
        '⁂-status-reactions-bar__button--active': reaction.me,
      })}
      key={reaction.name}
      onClick={handleClick}
      title={intl.formatMessage(messages.emojiCount, {
        emoji: `:${shortCode}:`,
        count: reaction.count,
      })}
      disabled={unauthenticated}
      {...bind}
    >
      <Emoji emoji={reaction.name} src={reaction.url ?? undefined} />

      <p>
        <AnimatedNumber value={reaction.count} obfuscate={obfuscate} short />
      </p>
    </button>
  );
};

const StatusReactionsBar: React.FC<IStatusReactionsBar> = ({ status, collapsed }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { me } = useLoggedIn();
  const { demetricator } = useSettings();
  const features = useFeatures();

  const handlePickEmoji = (emoji: EmojiType) => {
    dispatch(emojiReact(status.id, emoji.custom ? emoji.id : emoji.native, emoji.custom ? emoji.imageUrl : undefined, intl));
  };

  if ((demetricator || status.emoji_reactions.length === 0) && collapsed) return null;
  if (status.emoji_reactions.length === 0 && !features.emojiReacts) return null;

  const sortedReactions = status.emoji_reactions.toSorted((a, b) => (b.count ?? 0) - (a.count ?? 0));

  return (
    <div className='⁂-status-reactions-bar'>
      {sortedReactions.map((reaction) => reaction.count ? (
        <StatusReaction
          key={reaction.name}
          statusId={status.id}
          reaction={reaction}
          obfuscate={demetricator}
          unauthenticated={!me}
        />
      ) : null)}
      {me && (
        <EmojiPickerDropdown onPickEmoji={handlePickEmoji}>
          <button
            className='⁂-status-reactions-bar__picker-button emoji-picker-dropdown'
            title={intl.formatMessage(messages.addEmoji)}
          >
            <Icon src={require('@phosphor-icons/core/regular/smiley-sticker.svg')} />
          </button>
        </EmojiPickerDropdown>
      )}
    </div>
  );
};

export { StatusReactionsBar as default };
