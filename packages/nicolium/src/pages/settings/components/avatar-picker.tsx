import iconCameraPlus from '@phosphor-icons/core/regular/camera-plus.svg';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AltIndicator from '@/components/media/alt-indicator';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  changeDescriptionHeading: {
    id: 'group.upload_avatar.alt.heading',
    defaultMessage: 'Change avatar description',
  },
  changeDescriptionPlaceholder: {
    id: 'group.upload_avatar.alt.placeholder',
    defaultMessage: 'Image description',
  },
  changeDescriptionConfirm: { id: 'group.upload_avatar.alt.confirm', defaultMessage: 'Save' },
});

interface IMediaInput {
  className?: string;
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  disabled?: boolean;
  description?: string;
  onChangeDescription?: (value: string) => void;
}

const AvatarPicker = React.forwardRef<HTMLInputElement, IMediaInput>(
  ({ className, src, onChange, accept, disabled, description, onChangeDescription }, ref) => {
    const { openModal } = useModalsActions();
    const intl = useIntl();

    const picker = useRef<HTMLLabelElement>(null);

    const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
      onChange(files);
    });

    const handleChangeDescriptionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      e.stopPropagation();

      openModal('TEXT_FIELD', {
        heading: intl.formatMessage(messages.changeDescriptionHeading),
        placeholder: intl.formatMessage(messages.changeDescriptionPlaceholder),
        confirm: intl.formatMessage(messages.changeDescriptionConfirm),
        onConfirm: (description?: string) => {
          onChangeDescription?.(description ?? '');
        },
        text: description,
      });
    };

    return (
      <label
        ref={picker}
        className={clsx(
          'avatar-picker',
          {
            'avatar-picker--dragging': isDragging,
            'avatar-picker--dragged-over': isDraggedOver,
          },
          className,
        )}
      >
        {src && (
          <Avatar
            className={clsx(onChangeDescription && 'avatar-picker__avatar')}
            src={src}
            size={80}
          />
        )}
        <div className={clsx('avatar-picker__overlay', src && 'avatar-picker__overlay--has-image')}>
          <Icon src={iconCameraPlus} />
        </div>
        <span className='sr-only'>
          <FormattedMessage id='group.upload_avatar' defaultMessage='Upload avatar' />
        </span>
        <input
          ref={ref}
          name='avatar'
          type='file'
          accept={accept}
          onChange={({ target }) => {
            onChange(target.files);
          }}
          disabled={disabled}
          className='hidden'
        />
        {onChangeDescription && src && (
          <button
            type='button'
            className='avatar-picker__alt-button'
            onClick={handleChangeDescriptionClick}
          >
            <AltIndicator warning={!description} />
          </button>
        )}
      </label>
    );
  },
);

AvatarPicker.displayName = 'AvatarPicker';

export { AvatarPicker as default };
