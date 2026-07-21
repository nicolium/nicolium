import iconImage from '@phosphor-icons/core/regular/image.svg';
import iconPaperclip from '@phosphor-icons/core/regular/paperclip.svg';
import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from '@/components/ui/icon-button';
import { useInstance } from '@/stores/instance';

const messages = defineMessages({
  upload: { id: 'upload_button.label', defaultMessage: 'Add media attachment' },
});

const onlyImages = (types: string[] | undefined): boolean =>
  types?.every((type) => type.startsWith('image/')) ?? false;

interface IUploadButton {
  disabled?: boolean;
  unavailable?: boolean;
  onSelectFile: (files: FileList) => void;
  style?: React.CSSProperties;
  resetFileKey: number | null;
  className?: string;
  icon?: string;
}

const UploadButton: React.FC<IUploadButton> = ({
  disabled = false,
  unavailable = false,
  onSelectFile,
  resetFileKey,
  className,
  icon,
}) => {
  const intl = useIntl();
  const { configuration } = useInstance();

  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = configuration.media_attachments.supported_mime_types;

  let accept = attachmentTypes?.join(',');
  if (accept === 'application/octet-stream') accept = undefined;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      onSelectFile(e.target.files);
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  if (unavailable) {
    return null;
  }

  const src = icon ?? (onlyImages(attachmentTypes) ? iconImage : iconPaperclip);

  return (
    <div className='upload-button'>
      <IconButton
        src={src}
        className={className}
        title={intl.formatMessage(messages.upload)}
        disabled={disabled}
        onClick={handleClick}
      />

      <label aria-hidden>
        <input
          key={resetFileKey}
          ref={fileElement}
          type='file'
          multiple
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className='upload-button__input'
        />
      </label>
    </div>
  );
};

export { UploadButton as default };
