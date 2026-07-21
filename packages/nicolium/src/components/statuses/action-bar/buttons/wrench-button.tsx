import iconWrenchFill from '@phosphor-icons/core/fill/wrench-fill.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import { useFeatures } from '@/hooks/use-features';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import {
  useEmojiReactMutation,
  useEmojiUnreactMutation,
} from '@/queries/statuses/use-status-interactions';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import messages from '../messages';

import type { IActionButton } from '../types';
import type { CustomEmoji } from 'pl-api';

const getLongerWrench = (emojis: Array<CustomEmoji>) =>
  emojis.find(({ shortcode }) => shortcode === 'longestest_wrench') ??
  emojis.find(({ shortcode }) => shortcode === 'longest_wrench');

const WrenchButton: React.FC<IActionButton> = ({ status, withLabels, me, withCounters }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { openModal } = useModalsActions();
  const { wrenchModal } = useSettings();

  const { mutate: emojiReact } = useEmojiReactMutation(status.id);
  const { mutate: emojiUnreact } = useEmojiUnreactMutation(status.id);

  const { data: hasLongerWrench } = useCustomEmojis(getLongerWrench);

  if (!me || withLabels || !features.emojiReacts) return;

  const wrenches = status.emoji_reactions.find((emoji) => emoji.name === '🔧') ?? undefined;

  const checkConfirmation = (callback: () => void) => {
    if (wrenchModal) {
      openModal('CONFIRM', {
        heading: (
          <FormattedMessage id='confirmations.wrench.heading' defaultMessage='Wrench the post' />
        ),
        message: (
          <FormattedMessage
            id='confirmations.wrench.message'
            defaultMessage='Are you sure you want to wrench this post? This can have disastrous consequences.'
          />
        ),
        confirm: intl.formatMessage(messages.wrenchConfirm),
        onConfirm: callback,
      });
    } else {
      callback();
    }
  };

  const handleWrenchClick: React.EventHandler<React.MouseEvent> = () => {
    if (wrenches?.me) {
      emojiUnreact('🔧');
    } else {
      checkConfirmation(() => emojiReact('🔧'));
    }
  };

  const handleWrenchLongPress = (
    event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>,
  ) => {
    if (features.customEmojiReacts && hasLongerWrench) {
      checkConfirmation(() => emojiReact(hasLongerWrench.shortcode));
    } else if (wrenches?.count) {
      openModal(
        'REACTIONS',
        { statusId: status.id, reaction: wrenches.name },
        event.target as HTMLElement,
      );
    }
  };

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.wrench)}
      icon={iconWrench}
      filledIcon={iconWrenchFill}
      onClick={handleWrenchClick}
      onLongPress={handleWrenchLongPress}
      active={wrenches?.me}
      count={withCounters ? (wrenches?.count ?? undefined) : undefined}
    />
  );
};

export { WrenchButton };
