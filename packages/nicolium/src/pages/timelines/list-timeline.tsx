import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconListBullets from '@phosphor-icons/core/regular/list-bullets.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { ListTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { EmptyMessage } from '@/components/empty-message';
import { TimelinePicker } from '@/components/timeline-picker';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useDeleteList, useList } from '@/queries/accounts/use-lists';
import { listTimelineRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: {
    id: 'confirmations.delete_list.message',
    defaultMessage: 'Are you sure you want to permanently delete this list?',
  },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
  notFound: { id: 'list.not_found', defaultMessage: 'List not found' },
});

const ListTimelinePage: React.FC = () => {
  const { listId } = listTimelineRoute.useParams();

  const intl = useIntl();
  const { openModal } = useModalsActions();
  const navigate = useNavigate();
  const timelineFilterOptions = useTimelineFiltersOptions('list');

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
    return (
      <Column label={intl.formatMessage(messages.notFound)}>
        <EmptyMessage
          heading={<FormattedMessage id='list.not_found_heading' defaultMessage='List not found' />}
          text={
            <div className='flex flex-col items-center gap-4'>
              <FormattedMessage
                id='list.not_found'
                defaultMessage="It might have been deleted or you don't have permission to view it. Make sure you're viewing it from the correct account."
              />
              <Button to='/lists' theme='muted'>
                <FormattedMessage id='list.not_found.button' defaultMessage='Back to lists' />
              </Button>
            </div>
          }
        />
      </Column>
    );
  }

  const items = useMemo(
    () => [
      ...timelineFilterOptions,
      null,
      {
        text: intl.formatMessage(messages.editList),
        action: handleEditClick,
        icon: iconPencilSimple,
      },
      {
        text: intl.formatMessage(messages.deleteList),
        action: handleDeleteClick,
        icon: iconTrash,
      },
    ],
    [timelineFilterOptions],
  );

  return (
    <Column
      label={title}
      title={<TimelinePicker active={`list:${listId}`} />}
      truncateTitle={false}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <ListTimelineColumn
        listId={listId}
        emptyMessageText={
          <div>
            <FormattedMessage
              id='empty_column.list'
              defaultMessage='There is nothing in this list yet. When members of this list create new posts, they will appear here.'
            />
            <br />
            <Button onClick={handleEditClick}>
              <FormattedMessage id='list.click_to_add' defaultMessage='Click here to add people' />
            </Button>
          </div>
        }
        emptyMessageIcon={iconListBullets}
      />
    </Column>
  );
};

export { ListTimelinePage as default };
