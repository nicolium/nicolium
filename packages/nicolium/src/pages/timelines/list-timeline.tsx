import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchListTimeline } from '@/actions/timelines';
import { useListStream } from '@/api/hooks/streaming/use-list-stream';
import { ListTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Timeline from '@/features/ui/components/timeline';
import { listTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useDeleteList, useList } from '@/queries/accounts/use-lists';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: {
    id: 'confirmations.delete_list.message',
    defaultMessage: 'Are you sure you want to permanently delete this list?',
  },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
});

interface IListTimeline {
  listId: string;
}

const ListTimeline: React.FC<IListTimeline> = ({ listId }) => {
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const { openModal } = useModalsActions();

  const onlyMedia = settings.timelines[`list:${listId}`]?.other.onlyMedia ?? false;

  const handleLoadMore = () => {
    dispatch(fetchListTimeline(listId, true));
  };

  useListStream(listId);

  useEffect(() => {
    dispatch(fetchListTimeline(listId, false));
  }, [listId, onlyMedia]);

  const handleEditClick = () => {
    openModal('LIST_EDITOR', { listId });
  };

  return (
    <Timeline
      loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
      scrollKey={`list_${listId}_timeline`}
      timelineId={`list:${listId}${onlyMedia ? ':media' : ''}`}
      onLoadMore={handleLoadMore}
      emptyMessageText={
        <div>
          <FormattedMessage
            id='empty_column.list'
            defaultMessage='There is nothing in this list yet. When members of this list create new posts, they will appear here.'
          />
          <br />
          <br />
          <Button onClick={handleEditClick}>
            <FormattedMessage id='list.click_to_add' defaultMessage='Click here to add people' />
          </Button>
        </div>
      }
      emptyMessageIcon={require('@phosphor-icons/core/regular/list-bullets.svg')}
    />
  );
};

const ListTimelinePage: React.FC = () => {
  const { listId } = listTimelineRoute.useParams();

  const intl = useIntl();
  const { experimentalTimeline } = useSettings();
  const { openModal } = useModalsActions();
  const navigate = useNavigate();

  const { data: list, isFetching } = useList(listId);
  const { mutate: deleteList } = useDeleteList();

  const handleEditClick = () => {
    openModal('LIST_EDITOR', { listId });
  };

  const handleDeleteClick: React.EventHandler<React.KeyboardEvent | React.MouseEvent> = (e) => {
    e.preventDefault();

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteList(listId, {
          onSuccess: () => {
            navigate({ to: '/lists', replace: true });
          },
        });
      },
    });
  };

  const title = list ? list.title : listId;

  if (!list && isFetching) {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (!list) {
    return <MissingIndicator />;
  }

  const items = [
    {
      text: intl.formatMessage(messages.editList),
      action: handleEditClick,
      icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteList),
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
      {experimentalTimeline ? (
        <ListTimelineColumn listId={listId} />
      ) : (
        <ListTimeline listId={listId} />
      )}
    </Column>
  );
};

export { ListTimelinePage as default };
