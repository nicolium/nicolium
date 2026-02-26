import * as v from 'valibot';

import { announcementSchema } from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';

type EmptyObject = Record<string, never>;

const announcements = (client: PlApiBaseClient) => ({
  /**
   * View all announcements
   * See all currently active announcements set by admins.
   * @see {@link https://docs.joinmastodon.org/methods/announcements/#get}
   */
  getAnnouncements: async () => {
    const response = await client.request('/api/v1/announcements');

    return v.parse(filteredArray(announcementSchema), response.json);
  },

  /**
   * Dismiss an announcement
   * Allows a user to mark the announcement as read.
   * @see {@link https://docs.joinmastodon.org/methods/announcements/#dismiss}
   */
  dismissAnnouncements: async (announcementId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/announcements/${announcementId}`, {
      method: 'POST',
    });

    return response.json;
  },

  /**
   * Add a reaction to an announcement
   * React to an announcement with an emoji.
   * @see {@link https://docs.joinmastodon.org/methods/announcements/#put-reactions}
   */
  addAnnouncementReaction: async (announcementId: string, emoji: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/announcements/${announcementId}/reactions/${emoji}`,
      { method: 'PUT' },
    );

    return response.json;
  },

  /**
   * Remove a reaction from an announcement
   * Undo a react emoji to an announcement.
   * @see {@link https://docs.joinmastodon.org/methods/announcements/#delete-reactions}
   */
  deleteAnnouncementReaction: async (announcementId: string, emoji: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/announcements/${announcementId}/reactions/${emoji}`,
      { method: 'DELETE' },
    );

    return response.json;
  },
});

export { announcements };
