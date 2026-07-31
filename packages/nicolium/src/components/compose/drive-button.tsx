import iconCloudArrowUp from '@phosphor-icons/core/regular/cloud-arrow-up.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { appendMedia, useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { driveFileToMediaAttachment } from '@/utils/drive';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  button: { id: 'compose_form.drive_button', defaultMessage: 'Select from drive' },
});

interface IDriveButton {
  composeId: string;
}

const DriveButton: React.FC<IDriveButton> = ({ composeId }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();
  const { configuration } = useInstance();
  const { openModal } = useModalsActions();

  const attachmentTypes = configuration.media_attachments.supported_mime_types;

  const onClick = () => {
    openModal('SELECT_DRIVE_FILE', {
      title: intl.formatMessage(messages.button),
      type: 'file',
      accepted:
        attachmentTypes?.length === 0 && attachmentTypes[0] === 'application/octet-stream'
          ? undefined
          : attachmentTypes,
      onSelect: (file) => {
        const mediaAttachment = driveFileToMediaAttachment(file);

        updateCompose(composeId, (draft) => {
          appendMedia(draft, mediaAttachment);
        });
      },
    });
  };

  return (
    <ComposeFormButton
      icon={iconCloudArrowUp}
      title={intl.formatMessage(messages.button)}
      onClick={onClick}
    />
  );
};

export { DriveButton as default };
