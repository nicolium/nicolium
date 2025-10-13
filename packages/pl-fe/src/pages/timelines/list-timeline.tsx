import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchListTimeline } from 'pl-fe/actions/timelines';
import { useListStream } from 'pl-fe/api/hooks/streaming/use-list-stream';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useDeleteList, useList } from 'pl-fe/queries/accounts/use-lists';
import { useModalsStore } from 'pl-fe/stores/modals';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: { id: 'confirmations.delete_list.message', defaultMessage: 'Are you sure you want to permanently delete this list?' },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
});

const ListTimelinePage: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { openModal } = useModalsStore();

  const { data: list, isFetching } = useList(id);
  const { mutate: deleteList } = useDeleteList();

  useListStream(id);

  useEffect(() => {
    dispatch(fetchListTimeline(id));
  }, [id]);

  const handleLoadMore = () => {
    dispatch(fetchListTimeline(id, true));
  };

  const handleEditClick = () => {
    openModal('LIST_EDITOR', { listId: id });
  };

  const handleDeleteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteList(id);
      },
    });
  };

  const title = list ? list.title : id;

  if (!list && isFetching) {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (!list) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = (
    <div>
      <FormattedMessage id='empty_column.list' defaultMessage='There is nothing in this list yet. When members of this list create new posts, they will appear here.' />
      <br /><br />
      <Button onClick={handleEditClick}><FormattedMessage id='list.click_to_add' defaultMessage='Click here to add people' /></Button>
    </div>
  );

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
      action={<DropdownMenu items={items} src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')} />}
    >
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='list_timeline'
        timelineId={`list:${id}`}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
      />
    </Column>
  );
};

export { ListTimelinePage as default };
