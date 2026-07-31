import { mediaAttachmentSchema } from 'pl-api';
import * as v from 'valibot';

import type { DriveFile } from 'pl-api';

const driveFileToMediaAttachment = (file: DriveFile) => {
  let type = file.content_type.split('/')[0] as 'image' | 'video' | 'audio' | 'unknown';
  if (!['image', 'video', 'audio', 'unknown'].includes(type)) {
    type = 'unknown';
  }

  return v.parse(mediaAttachmentSchema, {
    id: file.id,
    url: file.url,
    preview_url: file.thumbnail_url,
    remote_url: file.url,
    description: file.description ?? '',
    type,
    mime_type: file.content_type,
  });
};

export { driveFileToMediaAttachment };
