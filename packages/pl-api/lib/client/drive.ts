import * as v from 'valibot';

import { driveFileSchema, driveFolderSchema, driveStatusSchema } from '../entities';

import type { PlApiBaseClient } from '../client-base';
import type { UpdateFileParams } from '../params/drive';

type EmptyObject = Record<string, never>;

const drive = (client: PlApiBaseClient) => ({
  getDrive: async () => {
    await client.getIceshrimpAccessToken();

    const response = await client.request('/api/iceshrimp/drive/folder');

    return v.parse(driveFolderSchema, response.json);
  },

  getFolder: async (id: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/folder/${id}`);

    return v.parse(driveFolderSchema, response.json);
  },

  createFolder: async (name: string, parentId?: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request('/api/iceshrimp/drive/folder', {
      method: 'POST',
      body: { name, parentId: parentId || null },
    });

    return v.parse(driveFolderSchema, response.json);
  },

  updateFolder: async (id: string, name: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/folder/${id}`, {
      method: 'PUT',
      body: name,
    });

    return v.parse(driveFolderSchema, response.json);
  },

  deleteFolder: async (id: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request<EmptyObject>(`/api/iceshrimp/drive/folder/${id}`, {
      method: 'DELETE',
    });

    return response;
  },

  moveFolder: async (id: string, targetFolderId?: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/folder/${id}/move`, {
      method: 'POST',
      body: { folderId: targetFolderId || null },
    });

    return v.parse(driveFolderSchema, response.json);
  },

  getFile: async (id: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/${id}`);

    return v.parse(driveFileSchema, response.json);
  },

  createFile: async (file: File, folderId?: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request('/api/iceshrimp/drive', {
      method: 'POST',
      body: { file },
      params: { folderId },
      contentType: '',
    });

    return v.parse(driveFileSchema, response.json);
  },

  updateFile: async (id: string, params: UpdateFileParams) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/${id}`, {
      method: 'PATCH',
      body: params,
    });

    return v.parse(driveFileSchema, response.json);
  },

  deleteFile: async (id: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request<Record<string, never>>(`/api/iceshrimp/drive/${id}`, {
      method: 'DELETE',
    });

    return response;
  },

  moveFile: async (id: string, targetFolderId?: string) => {
    await client.getIceshrimpAccessToken();

    const response = await client.request(`/api/iceshrimp/drive/${id}/move`, {
      method: 'POST',
      body: { folderId: targetFolderId || null },
    });

    return v.parse(driveFileSchema, response.json);
  },

  getDriveStatus: async () => {
    await client.getIceshrimpAccessToken();

    const response = await client.request('/api/iceshrimp/drive/status');

    return v.parse(driveStatusSchema, response.json);
  },
});

export { drive };
