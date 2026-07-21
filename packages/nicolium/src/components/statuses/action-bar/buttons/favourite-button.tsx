import iconStarFill from '@phosphor-icons/core/fill/star-fill.svg';
import iconThumbsUpFill from '@phosphor-icons/core/fill/thumbs-up-fill.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import iconThumbsUp from '@phosphor-icons/core/regular/thumbs-up.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import Popover from '@/components/ui/popover';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useFeatures } from '@/hooks/use-features';
import {
  useFavouriteStatus,
  useUnfavouriteStatus,
} from '@/queries/statuses/use-status-interactions';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import { InteractionPopover } from '../interaction-popover';
import messages from '../messages';

import type { IActionButton } from '../types';

const FavouriteButton: React.FC<IActionButton> = ({
  status,
  me,
  withLabels,
  onOpenUnauthorizedModal,
  withCounters,
}) => {
  const features = useFeatures();
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const canFavourite = useCanInteract(status, 'can_favourite');

  const { mutate: favouriteStatus } = useFavouriteStatus(status.id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status.id);

  const handleFavouriteClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      if (status.favourited) {
        unfavouriteStatus();
      } else {
        favouriteStatus(undefined, {
          onSuccess: () => {
            if (canFavourite.approvalRequired) toast.info(messages.favouriteApprovalRequired);
          },
        });
      }
    } else {
      onOpenUnauthorizedModal('FAVOURITE');
    }
  };

  const handleFavouriteLongPress = status.favourites_count
    ? (event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>) => {
        openModal('FAVOURITES', { statusId: status.id }, event.target as HTMLElement);
      }
    : undefined;

  const favouriteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.favourite)}
      icon={features.statusDislikes ? iconThumbsUp : iconStar}
      filledIcon={features.statusDislikes ? iconThumbsUpFill : iconStarFill}
      onClick={handleFavouriteClick}
      onLongPress={handleFavouriteLongPress}
      active={status.favourited}
      count={withCounters ? status.favourites_count : undefined}
      text={withLabels ? intl.formatMessage(messages.favourite) : undefined}
    />
  );

  if (me && !canFavourite.canInteract)
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canFavourite.allowed} type='favourite' />}
      >
        {favouriteButton}
      </Popover>
    );
  return favouriteButton;
};

export { FavouriteButton };
