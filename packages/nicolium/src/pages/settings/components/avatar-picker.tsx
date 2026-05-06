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
          '⁂-avatar-picker absolute bottom-0 left-1/2 size-20 -translate-x-1/2 translate-y-1/2 cursor-pointer rounded-lg bg-primary-300 ring-2',
          {
            '!z-[99] overflow-hidden border-2 border-dashed border-primary-600': isDragging,
            'ring-white dark:ring-primary-900': !isDraggedOver,
            'ring-primary-600 ring-offset-2': isDraggedOver,
          },
          className,
        )}
      >
        {src && (
          <Avatar className={clsx(onChangeDescription && '!rounded-lg')} src={src} size={80} />
        )}
        <div
          className={clsx(
            'absolute left-0 top-0 flex size-full items-center justify-center rounded-lg transition-opacity',
            {
              'bg-primary-500 opacity-0 hover:opacity-90': src,
            },
          )}
        >
          <Icon src={iconCameraPlus} className='size-5 text-white' />
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
            className='absolute left-1 top-1'
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
