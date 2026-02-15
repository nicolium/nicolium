import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchAntennaTimeline } from '@/actions/timelines';
import DropdownMenu from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
// import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Timeline from '@/features/ui/components/timeline';
import { antennaTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAntenna, useDeleteAntenna } from '@/queries/accounts/use-antennas';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_antenna.heading', defaultMessage: 'Delete antenna' },
  deleteMessage: {
    id: 'confirmations.delete_antenna.message',
    defaultMessage: 'Are you sure you want to permanently delete this antenna?',
  },
  deleteConfirm: { id: 'confirmations.delete_antenna.confirm', defaultMessage: 'Delete' },
  editAntenna: { id: 'antennas.edit', defaultMessage: 'Edit antenna' },
  deleteAntenna: { id: 'antennas.delete', defaultMessage: 'Delete antenna' },
});

const AntennaTimelinePage: React.FC = () => {
  const { antennaId } = antennaTimelineRoute.useParams();

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { openModal } = useModalsActions();
  const navigate = useNavigate();

  const { data: antenna, isFetching } = useAntenna(antennaId);
  const { mutate: deleteAntenna } = useDeleteAntenna();

  useEffect(() => {
    dispatch(fetchAntennaTimeline(antennaId));
  }, [antennaId]);

  const handleLoadMore = () => {
    dispatch(fetchAntennaTimeline(antennaId, true));
  };

  const handleEditClick = () => {
    openModal('ANTENNA_EDITOR', { antennaId });
  };

  const handleDeleteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteAntenna(antennaId, {
          onSuccess: () => {
            navigate({ to: '/antennas', replace: true });
          },
        });
      },
    });
  };

  const title = antenna ? antenna.title : antennaId;

  if (!antenna && isFetching) {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (!antenna) {
    return <MissingIndicator />;
  }

  const emptyMessage = (
    <div>
      <FormattedMessage
        id='empty_column.antenna'
        defaultMessage='There is nothing in this antenna yet. When posts matching the criteria will be created, they will appear here.'
      />
      {/* <br /><br />
      <Button onClick={handleEditClick}><FormattedMessage id='circle.click_to_add' defaultMessage='Click here to add people' /></Button> */}
    </div>
  );

  const items = [
    {
      text: intl.formatMessage(messages.editAntenna),
      action: handleEditClick,
      icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteAntenna),
      action: handleDeleteClick,
      icon: require('@phosphor-icons/core/regular/trash.svg'),
    },
  ];

  return (
    <Column
      label={title}
      action={
        <DropdownMenu
          items={items}
          src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')}
        />
      }
    >
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='antenna_timeline'
        timelineId={`antenna:${antennaId}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={emptyMessage}
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { AntennaTimelinePage as default };
