import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Blurhash from '@/components/media/blurhash';
import { getPointerPosition } from '@/components/media/video';
import FormGroup from '@/components/ui/form-group';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import { MIMETYPE_ICONS } from '@/components/upload';
import { useCompose } from '@/hooks/use-compose';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { MediaAttachment } from 'pl-api';

type FocalPoint = [number, number];

const messages = defineMessages({
  placeholderVisual: {
    id: 'alt_text_modal.describe_for_people_with_visual_impairments',
    defaultMessage: 'Describe this for people with visual impairments…',
  },
  placeholderHearing: {
    id: 'alt_text_modal.describe_for_people_with_hearing_impairments',
    defaultMessage: 'Describe this for people with hearing impairments…',
  },
  savingFailed: {
    id: 'alt_text_modal.save.fail',
    defaultMessage: 'Failed to save alt text',
  },
});

interface PreviewProps {
  media: MediaAttachment;
  position: FocalPoint;
  onPositionChange: (position: FocalPoint) => void;
}

const Preview: React.FC<PreviewProps> = ({ media, position: [x, y], onPositionChange }) => {
  const { focalPoint } = useFeatures();
  const withFocalPoint = focalPoint && (media.type === 'image' || media.type === 'gifv');

  // const [dragging, setDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<boolean>(false);

  const setRef = useCallback((e: HTMLDivElement | null) => {
    nodeRef.current = e;
  }, []);

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.button !== 0 || !nodeRef.current) {
        return;
      }

      const { x, y } = getPointerPosition(nodeRef.current, e);
      // setDragging(true);
      draggingRef.current = true;
      onPositionChange([x, y]);
    },
    [onPositionChange],
  );

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!nodeRef.current) return;

      const { x, y } = getPointerPosition(nodeRef.current, e);
      // setDragging(true);
      draggingRef.current = true;
      onPositionChange([x, y]);
    },
    [onPositionChange],
  );

  useEffect(() => {
    const handleMouseUp = () => {
      // setDragging(false);
      draggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current && nodeRef.current) {
        const { x, y } = getPointerPosition(nodeRef.current, e);
        onPositionChange([x, y]);
      }
    };

    const handleTouchEnd = () => {
      // setDragging(false);
      draggingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggingRef.current && nodeRef.current) {
        const { x, y } = getPointerPosition(nodeRef.current, e);
        onPositionChange([x, y]);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onPositionChange]);

  const uploadIcon = media.type === 'unknown' && (
    <Icon
      className='mx-auto my-12 size-16 text-gray-800 dark:text-gray-200'
      src={MIMETYPE_ICONS[media.mime_type ?? ''] || defaultIcon}
    />
  );

  return (
    <div className='relative overflow-hidden rounded-md'>
      <Blurhash hash={media.blurhash} className='⁂-media-gallery__preview' />
      <div
        className={clsx(
          'relative h-64 max-h-96 w-full overflow-hidden bg-contain bg-center bg-no-repeat',
          { 'cursor-grab': withFocalPoint },
        )}
        style={{
          backgroundImage:
            media.type === 'image' || media.type === 'gifv'
              ? `url(${media.preview_url})`
              : undefined,
          height:
            media.type === 'image' || media.type === 'video'
              ? media.meta.original?.height
              : undefined,
        }}
      >
        <div
          ref={setRef}
          className='absolute inset-0 size-full'
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {media.type === 'video' && (
            <video className='size-full object-cover' autoPlay playsInline muted loop>
              <source src={media.preview_url} />
            </video>
          )}
          {uploadIcon}
        </div>
      </div>
      {withFocalPoint && (
        <div
          className='pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white'
          style={{
            top: `${y * 100}%`,
            left: `${x * 100}%`,
            boxShadow: '0 0 0 9999em rgba(0,0,0,.35)',
          }}
        />
      )}
      <span className='absolute inset-x-2 bottom-2 w-fit overflow-hidden text-ellipsis rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white'>
        {media.url.split('/').at(-1)}
      </span>
    </div>
  );
};

interface AltTextModalProps {
  composeId?: string;
  descriptionLimit: number;
  media: MediaAttachment;
  onSubmit: (description: string, position: FocalPoint) => Promise<void>;
  previousDescription: string;
  previousPosition: FocalPoint;
}

const AltTextModal: React.FC<BaseModalProps & AltTextModalProps> = ({
  composeId,
  descriptionLimit,
  media,
  onClose,
  onSubmit,
  previousDescription,
  previousPosition,
}) => {
  const intl = useIntl();

  const { language } = useCompose(composeId ?? 'default');

  const [description, setDescription] = useState(previousDescription || '');
  const [position, setPosition] = useState(previousPosition || [0, 0]);
  const [isSaving, setIsSaving] = useState(false);
  const dirtyRef = useRef(Boolean(previousDescription));

  const handleDescriptionChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      setDescription(e.target.value);
      dirtyRef.current = true;
    },
    [setDescription],
  );

  const handlePositionChange = useCallback(
    (position: FocalPoint) => {
      setPosition(position);
      dirtyRef.current = true;
    },
    [setPosition],
  );

  const handleSubmit = useCallback(() => {
    setIsSaving(true);

    onSubmit(description, position)
      .then(() => {
        setIsSaving(false);
        dirtyRef.current = false;
        onClose();
        return '';
      })
      .catch(() => {
        setIsSaving(false);
        toast.error(messages.savingFailed);
      });
  }, [setIsSaving, media.id, onClose, description, position]);

  const handleKeyUp: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
      }
    },
    [handleSubmit],
  );

  const handleSave = () => {
    handleSubmit();
  };

  return (
    <Modal
      title={<FormattedMessage id='alt_text_modal.header' defaultMessage='Add alt text' />}
      confirmationAction={handleSave}
      confirmationText={<FormattedMessage id='alt_text_modal.confirmation' defaultMessage='Save' />}
      confirmationDisabled={isSaving}
      secondaryAction={() => {
        onClose('ALT_TEXT');
      }}
      secondaryText={<FormattedMessage id='alt_text_modal.cancel' defaultMessage='Cancel' />}
    >
      <div className='flex flex-col gap-2'>
        <Preview media={media} position={position} onPositionChange={handlePositionChange} />
        <form>
          <FormGroup
            labelText={intl.formatMessage(
              media.type === 'audio' ? messages.placeholderHearing : messages.placeholderVisual,
            )}
          >
            <Textarea
              value={description}
              maxLength={descriptionLimit}
              onChange={handleDescriptionChange}
              onKeyUp={handleKeyUp}
              lang={language ?? undefined}
              minRows={3}
              placeholder={intl.formatMessage(
                media.type === 'audio' ? messages.placeholderHearing : messages.placeholderVisual,
              )}
              disabled={isSaving}
            />
          </FormGroup>
        </form>
      </div>
    </Modal>
  );
};

export { type AltTextModalProps, AltTextModal as default };
