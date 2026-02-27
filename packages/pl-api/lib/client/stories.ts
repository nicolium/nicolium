import * as v from 'valibot';

import {
  accountSchema,
  storyCarouselItemSchema,
  storyMediaSchema,
  storyProfileSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreateStoryParams,
  CreateStoryPollParams,
  CropStoryPhotoParams,
  StoryReportType,
} from '@/params/stories';
import type { EmptyObject } from '@/utils/types';

const stories = (client: PlApiBaseClient) => ({
  getRecentStories: async () => {
    const response = await client.request('/api/web/stories/v1/recent');

    return v.parse(filteredArray(storyCarouselItemSchema), response.json);
  },

  getStoryViewers: async (storyId: string) => {
    const response = await client.request('/api/web/stories/v1/viewers', {
      params: { sid: storyId },
    });

    return v.parse(filteredArray(accountSchema), response.json);
  },

  getStoriesForProfile: async (accountId: string) => {
    const response = await client.request(`/api/web/stories/v1/profile/${accountId}`);

    return v.parse(filteredArray(storyProfileSchema), response.json);
  },

  storyExists: async (accountId: string) => {
    const response = await client.request(`/api/web/stories/v1/exists/${accountId}`);

    return v.parse(v.boolean(), response.json);
  },

  getStoryPollResults: async (storyId: string) => {
    const response = await client.request('/api/web/stories/v1/poll/results', {
      params: { sid: storyId },
    });

    return v.parse(v.array(v.number()), response.json);
  },

  markStoryAsViewed: async (storyId: string) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/viewed', {
      method: 'POST',
      body: { id: storyId },
    });

    return response.json;
  },

  createStoryReaction: async (storyId: string, emoji: string) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/react', {
      method: 'POST',
      body: { sid: storyId, reaction: emoji },
    });

    return response.json;
  },

  createStoryComment: async (storyId: string, comment: string) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/comment', {
      method: 'POST',
      body: { sid: storyId, caption: comment },
    });

    return response.json;
  },

  createStoryPoll: async (params: CreateStoryPollParams) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/publish/poll', {
      method: 'POST',
      body: params,
    });

    return response.json;
  },

  storyPollVote: async (storyId: string, choiceId: number) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/publish/poll', {
      method: 'POST',
      body: { sid: storyId, ci: choiceId },
    });

    return response.json;
  },

  reportStory: async (storyId: string, type: StoryReportType) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/report', {
      method: 'POST',
      body: { id: storyId, type },
    });

    return response.json;
  },

  addMedia: async (file: File) => {
    const response = await client.request('/api/web/stories/v1/add', {
      method: 'POST',
      body: { file },
      contentType: '',
    });

    return v.parse(storyMediaSchema, response.json);
  },

  cropPhoto: async (mediaId: string, params: CropStoryPhotoParams) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/crop', {
      method: 'POST',
      body: { media_id: mediaId, ...params },
    });

    return response.json;
  },

  createStory: async (mediaId: string, params: CreateStoryParams) => {
    const response = await client.request<EmptyObject>('/api/web/stories/v1/publish', {
      method: 'POST',
      body: { media_id: mediaId, ...params },
    });

    return response.json;
  },

  deleteStory: async (storyId: string) => {
    const response = await client.request<EmptyObject>(`/api/web/stories/v1/delete/${storyId}`, {
      method: 'DELETE',
    });

    return response.json;
  },
});

export { stories };
