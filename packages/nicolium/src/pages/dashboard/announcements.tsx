import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { FormattedDate, FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Text from '@/components/ui/text';
import { useAnnouncements, useDeleteAnnouncementMutation } from '@/queries/admin/use-announcements';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { AdminAnnouncement } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.announcements', defaultMessage: 'Announcements' },
  deleteConfirm: {
    id: 'confirmations.admin.delete_announcement.confirm',
    defaultMessage: 'Delete',
  },
  deleteHeading: {
    id: 'confirmations.admin.delete_announcement.heading',
    defaultMessage: 'Delete announcement',
  },
  deleteMessage: {
    id: 'confirmations.admin.delete_announcement.message',
    defaultMessage: 'Are you sure you want to delete the announcement?',
  },
  deleteSuccess: { id: 'admin.edit_announcement.deleted', defaultMessage: 'Announcement deleted' },
});

interface IAnnouncement {
  announcement: AdminAnnouncement;
}

const Announcement: React.FC<IAnnouncement> = ({ announcement }) => {
  const intl = useIntl();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncementMutation();
  const { openModal } = useModalsActions();

  const handleEditAnnouncement = () => {
    openModal('EDIT_ANNOUNCEMENT', { announcement });
  };

  const handleDeleteAnnouncement = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteAnnouncement(announcement.id, {
          onSuccess: () => {
            toast.success(messages.deleteSuccess);
          },
        });
      },
    });
  };

  return (
    <div key={announcement.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <div className='flex flex-col gap-2'>
        <Text>
          <ParsedContent html={announcement.content} emojis={announcement.emojis} />
        </Text>
        {(announcement.starts_at ?? announcement.ends_at ?? announcement.all_day) && (
          <div className='flex flex-wrap gap-2'>
            {announcement.starts_at && (
              <Text size='sm'>
                <Text tag='span' size='sm' weight='medium'>
                  <FormattedMessage
                    id='admin.announcements.starts_at'
                    defaultMessage='Starts at:'
                  />
                </Text>{' '}
                <FormattedDate
                  value={announcement.starts_at}
                  year='2-digit'
                  month='short'
                  day='2-digit'
                  weekday='short'
                />
              </Text>
            )}
            {announcement.ends_at && (
              <Text size='sm'>
                <Text tag='span' size='sm' weight='medium'>
                  <FormattedMessage id='admin.announcements.ends_at' defaultMessage='Ends at:' />
                </Text>{' '}
                <FormattedDate
                  value={announcement.ends_at}
                  year='2-digit'
                  month='short'
                  day='2-digit'
                  weekday='short'
                />
              </Text>
            )}
            {announcement.all_day && (
              <Text weight='medium' size='sm'>
                <FormattedMessage id='admin.announcements.all_day' defaultMessage='All day' />
              </Text>
            )}
          </div>
        )}
        <div className='flex justify-end gap-2'>
          <Button theme='primary' onClick={handleEditAnnouncement}>
            <FormattedMessage id='admin.announcements.edit' defaultMessage='Edit' />
          </Button>
          <Button theme='primary' onClick={handleDeleteAnnouncement}>
            <FormattedMessage id='admin.announcements.delete' defaultMessage='Delete' />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminAnnouncementsPage: React.FC = () => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const { data: announcements = [], isLoading, isPending } = useAnnouncements();

  const handleCreateAnnouncement = () => {
    openModal('EDIT_ANNOUNCEMENT');
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.admin.announcements'
      defaultMessage='There are no announcements yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='flex flex-col gap-4'>
        <Button
          className='sm:w-fit sm:self-end'
          icon={iconPlus}
          onClick={handleCreateAnnouncement}
          theme='secondary'
          block
        >
          <FormattedMessage id='admin.announcements.action' defaultMessage='Create announcement' />
        </Button>
        <ScrollableList
          scrollKey='announcements'
          emptyMessageText={emptyMessage}
          itemClassName='py-3 first:pt-0 last:pb-0'
          isLoading={isLoading}
          showLoading={isLoading && isPending}
        >
          {announcements.map((announcement) => (
            <Announcement key={announcement.id} announcement={announcement} />
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { AdminAnnouncementsPage as default };
