import iconUpload from '@phosphor-icons/core/regular/upload.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useInstance } from '@/stores/instance';

interface IUploadButton {
  disabled?: boolean;
  onSelectFile: (files: FileList) => void;
}

const UploadButton: React.FC<IUploadButton> = ({ disabled, onSelectFile }) => {
  const attachmentTypes =
    useInstance().configuration.media_attachments.supported_mime_types?.filter((type) =>
      type.startsWith('image/'),
    );

  let accept = attachmentTypes?.join(',');
  if (accept === 'application/octet-stream') accept = undefined;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      onSelectFile(e.target.files);
    }
  };

  return (
    <label className='edit-event__upload-button'>
      <Icon src={iconUpload} />

      <span className='edit-event__upload-button__label' tabIndex={0}>
        <FormattedMessage id='compose_event.upload_banner' defaultMessage='Upload event banner' />
      </span>
      <input type='file' accept={accept} onChange={handleChange} disabled={disabled} />
    </label>
  );
};

export { UploadButton as default };
