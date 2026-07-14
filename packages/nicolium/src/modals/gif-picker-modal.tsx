// Adapted from Chuckya
// https://github.com/TheEssem/mastodon/pull/42
import iconBackspace from '@phosphor-icons/core/regular/backspace.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import { useDebounce } from '@uidotdev/usehooks';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { EmptyMessage } from '@/components/empty-message';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useSearchGifs } from '@/queries/search/use-search-gifs';
import { useUploadCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import { isIOS } from '@/utils/is-mobile';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { GifResult } from 'pl-api';

const messages = {
  placeholder: { id: 'gif_picker_modal.search.placeholder', defaultMessage: 'Search GIFs' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  error: { id: 'gif_picker_modal.error', defaultMessage: 'Failed to upload GIF' },
};

interface IGifItem {
  gif: GifResult;
  onSelect: (value: GifResult) => void;
  disabled: boolean;
}

const GifItem: React.FC<IGifItem> = ({ gif, onSelect, disabled }) => {
  const { autoPlayGif } = useSettings();

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = ({
    currentTarget: video,
  }) => {
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = ({
    currentTarget: video,
  }) => {
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => !autoPlayGif && attachment.type === 'gifv';

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSelect(gif);
      }
    },
    [gif, onSelect],
  );

  const conditionalAttributes: React.VideoHTMLAttributes<HTMLVideoElement> = {};
  if (isIOS()) {
    conditionalAttributes.playsInline = true;
  }
  if (autoPlayGif) {
    conditionalAttributes.autoPlay = true;
  }

  return (
    <div className='media-gallery__item media-gallery__item--square'>
      <button
        className='media-gallery__item-thumbnail'
        onClick={handleClick}
        disabled={disabled}
        type='button'
      >
        <div
          className={clsx('media-gallery__gifv', { 'media-gallery__gifv--autoplay': autoPlayGif })}
        >
          <video
            className='media-gallery__item-gifv-thumbnail'
            aria-label={gif.description || undefined}
            title={gif.description || undefined}
            src={gif.url}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            loop
            muted
            {...conditionalAttributes}
          />
        </div>
      </button>
    </div>
  );
};

interface GifPickerModalProps {
  composeId: string;
}

const GifPickerModal: React.FC<BaseModalProps & GifPickerModalProps> = ({ composeId, onClose }) => {
  const intl = useIntl();

  const uploadCompose = useUploadCompose(composeId);

  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 400);
  const { data: gifsResult, isFetching, isError } = useSearchGifs(debouncedValue);
  const [isUploading, setIsUploading] = useState(false);

  const isEmpty = value.trim().length === 0;

  const onClickClose = () => {
    onClose('GIF_PICKER');
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setValue(target.value);
  };

  const handleClear: React.MouseEventHandler = (e) => {
    e.preventDefault();

    if (value.length > 0) {
      setValue('');
    }
  };

  const handleSelect = (gif: GifResult) => {
    setIsUploading(true);

    fetch(gif.url)
      .then((response) => response.blob())
      .then((blob) => {
        uploadCompose([new File([blob], 'gif')], [gif.description || '']);
        onClose();
      })
      .catch(() => {
        setIsUploading(false);
        toast.error(messages.error);
      });
  };

  return (
    <Modal
      title={<FormattedMessage id='gif_picker_modal.header.title' defaultMessage='Search GIFs' />}
      onClose={onClickClose}
    >
      <div className='gif-picker-modal'>
        <div className='location-search'>
          <Input
            placeholder={intl.formatMessage(messages.placeholder)}
            value={value}
            onChange={handleChange}
          />
          <button
            disabled={value.length === 0}
            tabIndex={0}
            onClick={handleClear}
            title={intl.formatMessage(messages.clear)}
            aria-label={intl.formatMessage(messages.clear)}
          >
            {isEmpty ? <Icon src={iconMagnifyingGlass} /> : <Icon src={iconBackspace} />}
          </button>
        </div>

        {isEmpty ? (
          <EmptyMessage
            text={
              <FormattedMessage
                id='gif_picker_modal.prompt_message'
                defaultMessage='Search for GIFs to attach to your post.'
              />
            }
            icon={iconMagnifyingGlass}
          />
        ) : !gifsResult && !isError ? (
          <Spinner />
        ) : gifsResult && gifsResult.results.length > 0 ? (
          <div
            className={clsx(
              'gif-picker-modal__results account-gallery__grid',
              isFetching && 'gif-picker-modal__results--loading',
            )}
          >
            {gifsResult.results.map((gif) => (
              <GifItem
                key={gif.id}
                gif={gif}
                onSelect={handleSelect}
                disabled={isFetching || isUploading}
              />
            ))}
          </div>
        ) : isError ? (
          <EmptyMessage
            text={
              <FormattedMessage
                id='gif_picker_modal.error_message'
                defaultMessage='An error occurred while searching for GIFs.'
              />
            }
          />
        ) : (
          <EmptyMessage
            text={
              <FormattedMessage
                id='gif_picker_modal.empty_message'
                defaultMessage='There are no GIFs matching your search.'
              />
            }
          />
        )}
        {gifsResult?.provider && (
          <span className='gif-picker-modal__provider'>
            <FormattedMessage
              id='gif_picker_modal.provider'
              defaultMessage='Powered by {provider}'
              values={{ provider: gifsResult.provider }}
            />
          </span>
        )}
      </div>
    </Modal>
  );
};

export { GifPickerModal as default, type GifPickerModalProps };
