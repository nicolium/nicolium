import { defineMessages, type IntlShape } from 'react-intl';

import { isLoggedIn } from '@/stores/auth';
import { getInstance } from '@/stores/instance';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { formatBytes, getVideoDuration } from '@/utils/media';
import resizeImage from '@/utils/resize-image';

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

const noOp = () => {};

const updateMedia = (client: PlApiClient, mediaId: string, params: UpdateMediaParams) =>
  client.media.updateMedia(mediaId, params);

const uploadMedia = (
  client: PlApiClient,
  body: UploadMediaParams,
  onUploadProgress: (e: ProgressEvent) => void = noOp,
) => client.media.uploadMedia(body, { onUploadProgress });

const uploadFile = async (
  client: PlApiClient,
  file: File,
  intl: IntlShape,
  onSuccess: (data: MediaAttachment) => void = () => {},
  onFail: (error: unknown) => void = () => {},
  onProgress: (e: ProgressEvent) => void = () => {},
  changeTotal: (value: number) => void = () => {},
) => {
  if (!isLoggedIn()) return;
  const { stripMetadata } = useSettingsStore.getState().settings;

  const {
    configuration: { media_attachments },
  } = getInstance();
  const maxImageSize = media_attachments.image_size_limit;
  const maxVideoSize = media_attachments.video_size_limit;
  const maxVideoDuration = media_attachments.video_duration_limit;

  const imageMatrixLimit = media_attachments.image_matrix_limit;

  const isImage = file.type.match(/image.*/);
  const isVideo = file.type.match(/video.*/);
  const videoDurationInSeconds = isVideo && maxVideoDuration ? await getVideoDuration(file) : 0;

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
  } else if (isVideo && maxVideoDuration && videoDurationInSeconds > maxVideoDuration) {
    const message = intl.formatMessage(messages.exceededVideoDurationLimit, {
      limit: maxVideoDuration,
    });
    toast.error(message);
    onFail(true);
    return;
  }

  // FIXME: Don't define const in loop
  resizeImage(file, imageMatrixLimit, stripMetadata)
    .then((resized) => {
      const data = new FormData();
      data.append('file', resized);
      // Account for disparity in size of original image and resized data
      changeTotal(resized.size - file.size);

      return uploadMedia(client, { file: resized }, onProgress).then((data) => {
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
      });
    })
    .catch((error) => {
      onFail(error);
    });
};

export { updateMedia, uploadMedia, uploadFile };
