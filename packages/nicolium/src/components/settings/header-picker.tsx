import iconUpload from '@phosphor-icons/core/regular/upload.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import AltIndicator from '@/components/media/alt-indicator';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  title: { id: 'group.upload_banner.title', defaultMessage: 'Upload background picture' },
  changeHeaderDescriptionHeading: {
    id: 'group.upload_banner.alt.heading',
    defaultMessage: 'Change header description',
  },
  changeHeaderDescriptionPlaceholder: {
    id: 'group.upload_banner.alt.placeholder',
    defaultMessage: 'Image description',
  },
  changeHeaderDescriptionConfirm: { id: 'group.upload_banner.alt.confirm', defaultMessage: 'Save' },
  clearHeader: { id: 'group.upload_banner.clear', defaultMessage: 'Clear header image' },
  changeDescription: {
    id: 'group.upload_banner.change.description',
    defaultMessage: 'Change alt text',
  },
});

interface IMediaInput {
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  onClear?: () => void;
  disabled?: boolean;
  description?: string;
  onChangeDescription?: (value: string) => void;
}

const HeaderPicker = React.forwardRef<HTMLInputElement, IMediaInput>(
  ({ src, onChange, onClear, accept, disabled, description, onChangeDescription }, ref) => {
    const { openModal } = useModalsActions();
    const intl = useIntl();

    const picker = useRef<HTMLLabelElement>(null);

    const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
      onChange(files);
    });

    const handleClear: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      e.stopPropagation();

      onClear!();
    };

    const handleChangeDescriptionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      e.stopPropagation();

      openModal('TEXT_FIELD', {
        heading: intl.formatMessage(messages.changeHeaderDescriptionHeading),
        placeholder: intl.formatMessage(messages.changeHeaderDescriptionPlaceholder),
        confirm: intl.formatMessage(messages.changeHeaderDescriptionConfirm),
        onConfirm: (description?: string) => {
          onChangeDescription?.(description ?? '');
        },
        text: description,
      });
    };

    return (
      <label
        ref={picker}
        className={clsx('header-picker', {
          'header-picker--dragging': isDragging,
          'header-picker--dragged-over': isDraggedOver,
        })}
        title={intl.formatMessage(messages.title)}
        tabIndex={0}
      >
        {src && <img src={src} alt={intl.formatMessage(messages.title)} />}
        <div>
          <Icon src={iconUpload} />

          <p>
            <FormattedMessage id='group.upload_banner' defaultMessage='Upload photo' />
          </p>

          <input
            ref={ref}
            name='header'
            type='file'
            accept={accept}
            onChange={({ target }) => {
              onChange(target.files);
            }}
            disabled={disabled}
          />
        </div>
        {onClear && src && (
          <IconButton
            onClick={handleClear}
            src={iconX}
            theme='dark'
            className='header-picker__clear-button'
            title={intl.formatMessage(messages.clearHeader)}
          />
        )}
        {onChangeDescription && src && (
          <button
            type='button'
            className='header-picker__alt-button'
            onClick={handleChangeDescriptionClick}
            title={intl.formatMessage(messages.changeDescription)}
          >
            <AltIndicator warning={!description} />
          </button>
        )}
      </label>
    );
  },
);

HeaderPicker.displayName = 'HeaderPicker';

export { HeaderPicker as default };
