import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/icon';
import Text from '@/components/ui/text';
import { useAppSelector } from '@/hooks/use-app-selector';

interface IUploadButton {
  disabled?: boolean;
  onSelectFile: (files: FileList) => void;
}

const UploadButton: React.FC<IUploadButton> = ({ disabled, onSelectFile }) => {
  const fileElement = useRef<HTMLInputElement>(null);

  const attachmentTypes = useAppSelector(
    (state) => state.instance.configuration.media_attachments.supported_mime_types,
  )?.filter((type) => type.startsWith('image/'));

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

  return (
    <label className='flex size-full cursor-pointer items-center justify-center gap-3 text-primary-500 dark:text-primary-400'>
      <Icon
        src={require('@phosphor-icons/core/regular/upload.svg')}
        className='size-7'
        onClick={handleClick}
      />

      <Text size='sm' theme='primary' weight='semibold' transform='uppercase' tabIndex={0}>
        <FormattedMessage id='compose_event.upload_banner' defaultMessage='Upload event banner' />
      </Text>
      <input
        ref={fileElement}
        type='file'
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
};

export { UploadButton as default };
