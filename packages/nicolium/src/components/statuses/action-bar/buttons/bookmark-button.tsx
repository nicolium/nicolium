import iconBookmarkFill from '@phosphor-icons/core/fill/bookmark-fill.svg';
import iconBookmarkSimple from '@phosphor-icons/core/regular/bookmark-simple.svg';
import React from 'react';
import { useIntl } from 'react-intl';

import StatusActionButton from '@/components/statuses/status-action-button';
import { useFeatures } from '@/hooks/use-features';
import { useBookmarkStatus, useUnbookmarkStatus } from '@/queries/statuses/use-status-interactions';
import { useModalsActions } from '@/stores/modals';

import messages from '../messages';

import type { IActionButton } from '../types';

const BookmarkButton: React.FC<IActionButton> = ({ status, me }) => {
  const { openModal } = useModalsActions();
  const features = useFeatures();
  const intl = useIntl();

  const { mutate: bookmarkStatus } = useBookmarkStatus(status.id);
  const { mutate: unbookmarkStatus } = useUnbookmarkStatus(status.id);

  const handleBookmarkClick: React.EventHandler<React.MouseEvent> = () => {
    if (status.bookmarked) unbookmarkStatus();
    else bookmarkStatus(undefined);
  };

  const handleBookmarkLongPress = (
    event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>,
  ) => {
    openModal(
      'SELECT_BOOKMARK_FOLDER',
      {
        statusId: status.id,
      },
      event.target as HTMLElement,
    );
  };

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.bookmark)}
      icon={iconBookmarkSimple}
      filledIcon={iconBookmarkFill}
      onClick={handleBookmarkClick}
      onLongPress={
        status.bookmarked && features.bookmarkFolders ? handleBookmarkLongPress : undefined
      }
      active={status.bookmarked}
      disabled={!me}
    />
  );
};

export { BookmarkButton };
