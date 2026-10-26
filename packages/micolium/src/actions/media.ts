import { defineMessages, type IntlShape } from 'react-intl';
import { toast } from 'sonner-native';

import { formatBytes } from '@/utils/media';

import type { MediaAttachment, PlApiClient, UpdateMediaParams, UploadMediaParams } from 'pl-api';

const messages = defineMessages({
  exceededImageSizeLimit: {
    id: 'upload_error.image_size_limit',
    defaultMessage: 'Image exceeds the current file size limit ({limit})',
  },
  exceededVideoSizeLimit: {
    id: 'upload_error.video_size_limit',
    defaultMessage: 'Video exceeds the current file size limit ({limit})',
  },
  exceededVideoDurationLimit: {
    id: 'upload_error.video_duration_limit',
    defaultMessage:
      'Video exceeds the current duration limit ({limit, plural, one {# second} other {# seconds}})',
  },
});

interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  duration?: number | null;
}

const noOp = () => {};

const updateMedia = (client: PlApiClient, mediaId: string, params: UpdateMediaParams) =>
  client.media.updateMedia(mediaId, params);

const uploadMedia = (
  client: PlApiClient,
  body: UploadMediaParams,
  onUploadProgress: (e: ProgressEvent) => void = noOp,
) => client.media.uploadMedia(body, { onUploadProgress });

const uploadFile = (
  client: PlApiClient,
  file: PickedFile,
  description: string | undefined = undefined,
  intl: IntlShape,
  onSuccess: (data: MediaAttachment) => void = () => {},
  onFail: (error: unknown) => void = () => {},
  onProgress: (e: ProgressEvent) => void = () => {},
) => {
  const {
    configuration: { media_attachments },
  } = client.instanceInformation;
  const maxImageSize = media_attachments.image_size_limit;
  const maxVideoSize = media_attachments.video_size_limit;
  const maxVideoDuration = media_attachments.video_duration_limit;

  // const imageMatrixLimit = media_attachments.image_matrix_limit;

  const isImage = file.type.match(/image.*/);
  const isVideo = file.type.match(/video.*/);

  if (isImage && maxImageSize && file.size > maxImageSize) {
    const limit = formatBytes(maxImageSize);
    const message = intl.formatMessage(messages.exceededImageSizeLimit, { limit });
    toast.error(message);
    onFail(true);
    return;
  } else if (isVideo && maxVideoSize && file.size > maxVideoSize) {
    const limit = formatBytes(maxVideoSize);
    const message = intl.formatMessage(messages.exceededVideoSizeLimit, { limit });
    toast.error(message);
    onFail(true);
    return;
  } else if (isVideo && maxVideoDuration && (file.duration ?? 0) > maxVideoDuration) {
    const message = intl.formatMessage(messages.exceededVideoDurationLimit, {
      limit: maxVideoDuration,
    });
    toast.error(message);
    onFail(true);
    return;
  }

  const body = {
    file: { uri: file.uri, name: file.name, type: file.type } as unknown as File,
    description,
  };

  uploadMedia(client, body, onProgress)
    .then((data) => {
      // If server-side processing of the media attachment has not completed yet,
      // poll the server until it is, before showing the media attachment as uploaded
      if (data.url) {
        onSuccess(data);
      } else if (data.url === '') {
        const poll = () => {
          client.media
            .getMedia(data.id)
            .then((data) => {
              if (data.url) {
                onSuccess(data);
              } else if (data.url === '') {
                setTimeout(() => {
                  poll();
                }, 1000);
              }
            })
            .catch((error) => {
              onFail(error);
            });
        };

        poll();
      }
    })
    .catch((error) => {
      onFail(error);
    });
};

export { type PickedFile, updateMedia, uploadMedia, uploadFile };
