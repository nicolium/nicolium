import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';
import { DatePicker } from '@/features/ui/util/async-components';
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '@/queries/admin/use-announcements';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { AdminAnnouncement } from 'pl-api';

const messages = defineMessages({
  save: { id: 'admin.edit_announcement.save', defaultMessage: 'Save' },
  announcementContentPlaceholder: {
    id: 'admin.edit_announcement.fields.content.placeholder',
    defaultMessage: 'Announcement content',
  },
  announcementStartTimePlaceholder: {
    id: 'admin.edit_announcement.fields.start_time.placeholder',
    defaultMessage: 'Announcement starts on:',
  },
  announcementEndTimePlaceholder: {
    id: 'admin.edit_announcement.fields.end_time.placeholder',
    defaultMessage: 'Announcement ends on:',
  },
  announcementCreateSuccess: {
    id: 'admin.edit_announcement.created',
    defaultMessage: 'Announcement created',
  },
  announcementUpdateSuccess: {
    id: 'admin.edit_announcement.updated',
    defaultMessage: 'Announcement edited',
  },
});

interface EditAnnouncementModalProps {
  announcement?: AdminAnnouncement;
}

const EditAnnouncementModal: React.FC<BaseModalProps & EditAnnouncementModalProps> = ({
  onClose,
  announcement,
}) => {
  const { mutate: createAnnouncement } = useCreateAnnouncementMutation();
  const { mutate: updateAnnouncement } = useUpdateAnnouncementMutation();
  const intl = useIntl();

  const [content, setContent] = useState(announcement?.raw_content ?? '');
  const [startTime, setStartTime] = useState(
    announcement?.starts_at ? new Date(announcement.starts_at) : null,
  );
  const [endTime, setEndTime] = useState(
    announcement?.ends_at ? new Date(announcement.ends_at) : null,
  );
  const [allDay, setAllDay] = useState(announcement?.all_day ?? false);

  const onChangeContent: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    setContent(target.value);
  };

  const onChangeStartTime = (date: Date | null) => {
    setStartTime(date);
  };

  const onChangeEndTime = (date: Date | null) => {
    setEndTime(date);
  };

  const onChangeAllDay: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setAllDay(target.checked);
  };

  const onClickClose = () => {
    onClose('EDIT_ANNOUNCEMENT');
  };

  const handleSubmit = () => {
    const form = {
      content,
      starts_at: startTime?.toISOString() ?? undefined,
      ends_at: endTime?.toISOString() ?? undefined,
      all_day: allDay,
    };

    if (announcement) {
      updateAnnouncement(
        { ...form, id: announcement.id },
        {
          onSuccess: () => {
            onClose('EDIT_ANNOUNCEMENT');
            toast.success(messages.announcementUpdateSuccess);
          },
        },
      );
    } else {
      createAnnouncement(form, {
        onSuccess: () => {
          onClose('EDIT_ANNOUNCEMENT');
          toast.success(messages.announcementCreateSuccess);
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={
        announcement ? (
          <FormattedMessage
            id='column.admin.edit_announcement'
            defaultMessage='Edit announcement'
          />
        ) : (
          <FormattedMessage
            id='column.admin.create_announcement'
            defaultMessage='Create announcement'
          />
        )
      }
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <Form>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_announcement.fields.content.label'
              defaultMessage='Content'
            />
          }
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.announcementContentPlaceholder)}
            value={content}
            onChange={onChangeContent}
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_announcement.fields.start_time.label'
              defaultMessage='Start date'
            />
          }
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementStartTimePlaceholder)}
            selected={startTime}
            onChange={onChangeStartTime}
            isClearable
            portalId='app'
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_announcement.fields.end_time.label'
              defaultMessage='End date'
            />
          }
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementEndTimePlaceholder)}
            selected={endTime}
            onChange={onChangeEndTime}
            isClearable
          />
        </FormGroup>
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='admin.edit_announcement.fields.all_day.label'
                defaultMessage='All-day event'
              />
            }
            hint={
              <FormattedMessage
                id='admin.edit_announcement.fields.all_day.hint'
                defaultMessage='When checked, only the dates of the time range will be displayed'
              />
            }
          >
            <Toggle checked={allDay} onChange={onChangeAllDay} />
          </ListItem>
        </List>
      </Form>
    </Modal>
  );
};

export { EditAnnouncementModal as default, type EditAnnouncementModalProps };
