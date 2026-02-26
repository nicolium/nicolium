import * as v from 'valibot';

import { mediaAttachmentSchema } from '../entities';
import { type RequestMeta } from '../request';

import type { PlApiBaseClient } from '../client-base';
import type { UpdateMediaParams, UploadMediaParams } from '../params/media';

type EmptyObject = Record<string, never>;

const media = (client: PlApiBaseClient) => ({
  /**
   * Upload media as an attachment
   * Creates a media attachment to be used with a new status. The full sized media will be processed asynchronously in the background for large uploads.
   * @see {@link https://docs.joinmastodon.org/methods/media/#v2}
   */
  uploadMedia: async (params: UploadMediaParams, meta?: RequestMeta) => {
    const response = await client.request(
      client.features.mediaV2 ? '/api/v2/media' : '/api/v1/media',
      { ...meta, method: 'POST', body: params, contentType: '' },
    );

    return v.parse(mediaAttachmentSchema, response.json);
  },

  /**
   * Get media attachment
   * Get a media attachment, before it is attached to a status and posted, but after it is accepted for processing. Use this method to check that the full-sized media has finished processing.
   * @see {@link https://docs.joinmastodon.org/methods/media/#get}
   */
  getMedia: async (attachmentId: string) => {
    const response = await client.request(`/api/v1/media/${attachmentId}`);

    return v.parse(mediaAttachmentSchema, response.json);
  },

  /**
   * Update media attachment
   * Update a MediaAttachment’s parameters, before it is attached to a status and posted.
   * @see {@link https://docs.joinmastodon.org/methods/media/#update}
   */
  updateMedia: async (attachmentId: string, params: UpdateMediaParams) => {
    const response = await client.request(`/api/v1/media/${attachmentId}`, {
      method: 'PUT',
      body: params,
      contentType: params.thumbnail ? '' : undefined,
    });

    return v.parse(mediaAttachmentSchema, response.json);
  },

  /**
   * Update media attachment
   * Update a MediaAttachment’s parameters, before it is attached to a status and posted.
   *
   * Requires features{@link Features.deleteMedia}.
   * @see {@link https://docs.joinmastodon.org/methods/media/delete}
   */
  deleteMedia: async (attachmentId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/media/${attachmentId}`, {
      method: 'DELETE',
    });

    return response.json;
  },
});

export { media };
