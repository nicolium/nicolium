import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { CircleTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
import { TimelinePicker } from '@/components/timeline-picker';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useCircle, useDeleteCircle } from '@/queries/accounts/use-circles';
import { circleTimelineRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_circle.heading', defaultMessage: 'Delete circle' },
  deleteMessage: {
    id: 'confirmations.delete_circle.message',
    defaultMessage: 'Are you sure you want to permanently delete this circle?',
  },
  deleteConfirm: { id: 'confirmations.delete_circle.confirm', defaultMessage: 'Delete' },
  editCircle: { id: 'circles.edit', defaultMessage: 'Edit circle' },
  deleteCircle: { id: 'circles.delete', defaultMessage: 'Delete circle' },
});

const CircleTimelinePage: React.FC = () => {
  const { circleId } = circleTimelineRoute.useParams();

  const intl = useIntl();
  const { openModal } = useModalsActions();
  const navigate = useNavigate();
  const timelineId = `circle:${circleId}` as const;
  const timelineFilterOptions = useTimelineFiltersOptions('circle', timelineId);

  const { data: circle, isFetching } = useCircle(circleId);
  const { mutate: deleteCircle } = useDeleteCircle();

  const handleEditClick = () => {
    openModal('CIRCLE_EDITOR', { circleId });
  };

  const handleDeleteClick: React.EventHandler<React.KeyboardEvent | React.MouseEvent> = (e) => {
    e.preventDefault();

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteCircle(circleId, {
          onSuccess: () => {
            navigate({ to: '/circles', replace: true });
          },
        });
      },
    });
  };

  const title = circle ? circle.title : circleId;

  const items = useMemo(
    () => [
      ...timelineFilterOptions,
      null,
      {
        text: intl.formatMessage(messages.editCircle),
        action: handleEditClick,
        icon: iconPencilSimple,
      },
      {
        text: intl.formatMessage(messages.deleteCircle),
        action: handleDeleteClick,
        icon: iconTrash,
      },
    ],
    [timelineFilterOptions],
  );

  if (!circle && isFetching) {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (!circle) {
    return <MissingIndicator />;
  }

  return (
    <Column
      label={title}
      action={
        <>
          <TimelineRefreshButton timelineId={timelineId} />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
      title={<TimelinePicker active={timelineId} />}
      truncateTitle={false}
    >
      <CircleTimelineColumn
        circleId={circleId}
        emptyMessageText={
          <div>
            <FormattedMessage
              id='empty_column.circle'
              defaultMessage='There is nothing in this circle yet. When members of this circle create new posts, they will appear here.'
            />
            <br />
            <br />
            <Button onClick={handleEditClick}>
              <FormattedMessage
                id='circle.click_to_add'
                defaultMessage='Click here to add people'
              />
            </Button>
          </div>
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { CircleTimelinePage as default };
