import iconThumbsDownFill from '@phosphor-icons/core/fill/thumbs-down-fill.svg';
import iconThumbsDown from '@phosphor-icons/core/regular/thumbs-down.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import { useFeatures } from '@/hooks/use-features';
import { useDislikeStatus, useUndislikeStatus } from '@/queries/statuses/use-status-interactions';
import { useModalsActions } from '@/stores/modals';

import messages from '../messages';

import type { IActionButton } from '../types';

const DislikeButton: React.FC<IActionButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  withCounters,
}) => {
  const features = useFeatures();
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const { mutate: dislikeStatus } = useDislikeStatus(status.id);
  const { mutate: undislikeStatus } = useUndislikeStatus(status.id);

  if (!features.statusDislikes) return;

  const handleDislikeClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      if (status.disliked) {
        undislikeStatus();
      } else {
        dislikeStatus();
      }
    } else {
      onOpenUnauthorizedModal('DISLIKE');
    }
  };

  const handleDislikeLongPress = status.dislikes_count
    ? (event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>) => {
        openModal('DISLIKES', { statusId: status.id }, event.target as HTMLElement);
      }
    : undefined;

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.disfavourite)}
      icon={iconThumbsDown}
      filledIcon={iconThumbsDownFill}
      onClick={handleDislikeClick}
      onLongPress={handleDislikeLongPress}
      active={status.disliked}
      count={withCounters ? status.dislikes_count : undefined}
      text={withLabels ? intl.formatMessage(messages.disfavourite) : undefined}
    />
  );
};

export { DislikeButton };
