import defaultIcon from '@tabler/icons/outline/paperclip.svg';
import React, { useCallback, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Blurhash from 'pl-fe/components/blurhash';
import FormGroup from 'pl-fe/components/ui/form-group';
import Icon from 'pl-fe/components/ui/icon';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Textarea from 'pl-fe/components/ui/textarea';
import { MIMETYPE_ICONS } from 'pl-fe/components/upload';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';
import type { MediaAttachment } from 'pl-api';

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
    id: 'alt_text_modal.saving_failed',
    defaultMessage: 'Failed to save alt text',
  },
});

interface AltTextModalProps {
  composeId?: string;
  previousDescription: string;
  descriptionLimit: number;
  media: MediaAttachment;
  onSubmit: (description: string) => Promise<void>;
}

const AltTextModal: React.FC<BaseModalProps & AltTextModalProps> = ({ composeId, media, onClose, onSubmit, previousDescription, descriptionLimit }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { language } = useCompose(composeId || 'default');

  const [description, setDescription] = useState(media.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const dirtyRef = useRef(previousDescription ? true : false);

  const uploadIcon = media.type === 'unknown' && (
    <Icon
      className='mx-auto my-12 size-16 text-gray-800 dark:text-gray-200'
      src={MIMETYPE_ICONS[media.mime_type || ''] || defaultIcon}
    />
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      dirtyRef.current = true;
    },
    [setDescription],
  );

  const handleSubmit = useCallback(() => {
    setIsSaving(true);

    onSubmit(description).then(() => {
      setIsSaving(false);
      dirtyRef.current = false;
      onClose();
      return '';
    }).catch((err: unknown) => {
      setIsSaving(false);
      toast.error(messages.savingFailed);
    });
  }, [dispatch, setIsSaving, media.id, onClose, description]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
    }
  }, [handleSubmit]);

  const handleSave = () => {
    handleSubmit();
    // onClose();
  };

  return (
    <Modal
      title={<FormattedMessage id='alt_text_modal.header' defaultMessage='Add alt text' />}
      // onClose={onClickClose}
      confirmationAction={handleSave}
      confirmationText={<FormattedMessage id='alt_text_modal.confirmation' defaultMessage='Save' />}
      confirmationDisabled={isSaving}
    >
      <Stack space={2}>
        <div className='relative overflow-hidden rounded-md'>
          <Blurhash hash={media.blurhash} className='media-gallery__preview' />
          <div
            className='relative h-40 w-full overflow-hidden bg-contain bg-center bg-no-repeat'
            style={{
              backgroundImage: media.type === 'image' ? `url(${media.preview_url})` : undefined,
            }}
          >
            <div className='absolute inset-0 size-full'>
              {media.type === 'video' && (
                <video className='size-full object-cover' autoPlay playsInline muted loop>
                  <source src={media.preview_url} />
                </video>
              )}
              {uploadIcon}
            </div>
            <span className='absolute inset-x-2 bottom-2 w-fit overflow-hidden text-ellipsis rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white'>
              {media.url.split('/').at(-1)}
            </span>
          </div>
        </div>
        <form>
          <FormGroup
            labelText={intl.formatMessage(
              media.type === 'audio'
                ? messages.placeholderHearing
                : messages.placeholderVisual,
            )}
          >
            <Textarea
              className=''
              value={description}
              maxLength={descriptionLimit}
              onChange={handleDescriptionChange}
              onKeyUp={handleKeyUp}
              lang={language || undefined}
              minRows={3}
              placeholder={intl.formatMessage(
                media.type === 'audio'
                  ? messages.placeholderHearing
                  : messages.placeholderVisual,
              )}
              disabled={isSaving}
            />
          </FormGroup>
        </form>
      </Stack>
    </Modal>
  );
};

export { type AltTextModalProps, AltTextModal as default };
