import { mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import { uploadComposeSuccess } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useInstance } from '@/hooks/use-instance';
import { useModalsActions } from '@/stores/modals';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  button: { id: 'compose_form.drive_button', defaultMessage: 'Select from drive' },
});

interface IDriveButton {
  composeId: string;
}

const DriveButton: React.FC<IDriveButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { configuration } = useInstance();
  const { openModal } = useModalsActions();

  const attachmentTypes = configuration.media_attachments.supported_mime_types;

  const onClick = () => openModal('SELECT_DRIVE_FILE', {
    title: intl.formatMessage(messages.button),
    type: 'file',
    accepted: (attachmentTypes?.length === 0 && attachmentTypes[0] === 'application/octet-stream') ? undefined : attachmentTypes,
    onSelect: (file) => {
      let type = file.content_type.split('/')[0] as 'image' | 'video' | 'audio' | 'unknown';
      if (!['image', 'video', 'audio', 'unknown'].includes(type)) {
        type = 'unknown';
      }

      const mediaAttachment = v.parse(mediaAttachmentSchema, {
        id: file.id,
        url: file.url,
        preview_url: file.thumbnail_url,
        remote_url: file.url,
        description: file.description || '',
        type,
        mime_type: file.content_type,
      });

      dispatch(uploadComposeSuccess(composeId, mediaAttachment));
    },
  });

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/cloud-arrow-up.svg')}
      title={intl.formatMessage(messages.button)}
      onClick={onClick}
    />
  );
};

export { DriveButton as default };
