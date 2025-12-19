import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchCircleTimeline } from 'pl-fe/actions/timelines';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { circleTimelineRoute } from 'pl-fe/features/ui/router';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCircle, useDeleteCircle } from 'pl-fe/queries/accounts/use-circles';
import { useModalsActions } from 'pl-fe/stores/modals';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_circle.heading', defaultMessage: 'Delete circle' },
  deleteMessage: { id: 'confirmations.delete_circle.message', defaultMessage: 'Are you sure you want to permanently delete this circle?' },
  deleteConfirm: { id: 'confirmations.delete_circle.confirm', defaultMessage: 'Delete' },
  editCircle: { id: 'circles.edit', defaultMessage: 'Edit circle' },
  deleteCircle: { id: 'circles.delete', defaultMessage: 'Delete circle' },
});

const CircleTimelinePage: React.FC = () => {
  const { circleId } = circleTimelineRoute.useParams();

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { openModal } = useModalsActions();

  const { data: circle, isFetching } = useCircle(circleId);
  const { mutate: deleteCircle } = useDeleteCircle();

  useEffect(() => {
    dispatch(fetchCircleTimeline(circleId));
  }, [circleId]);

  const handleLoadMore = () => {
    dispatch(fetchCircleTimeline(circleId, true));
  };

  const handleEditClick = () => {
    openModal('CIRCLE_EDITOR', { circleId });
  };

  const handleDeleteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteCircle(circleId);
      },
    });
  };

  const title = circle ? circle.title : circleId;

  if (!circle && isFetching) {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (!circle) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = (
    <div>
      <FormattedMessage id='empty_column.circle' defaultMessage='There is nothing in this circle yet. When members of this circle create new posts, they will appear here.' />
      <br /><br />
      <Button onClick={handleEditClick}><FormattedMessage id='circle.click_to_add' defaultMessage='Click here to add people' /></Button>
    </div>
  );

  const items = [
    {
      text: intl.formatMessage(messages.editCircle),
      action: handleEditClick,
      icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteCircle),
      action: handleDeleteClick,
      icon: require('@phosphor-icons/core/regular/trash.svg'),
    },
  ];

  return (
    <Column
      label={title}
      action={<DropdownMenu items={items} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />}
    >
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='circle_timeline'
        timelineId={`circle:${circleId}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={emptyMessage}
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { CircleTimelinePage as default };
