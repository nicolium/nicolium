import { createSelector } from 'reselect';

import { useAccountMediaTimeline, useGroupMediaTimeline } from '@/queries/timelines/use-account-media-timeline';

import { useAppSelector } from './use-app-selector';

import type { RootState } from '@/store';
import type { MediaAttachment } from 'pl-api';

type AccountGalleryAttachment = MediaAttachment & {
  index: number;
  sensitive: boolean;
  visibility: string;
  status_id: string;
  account_id: string;
}

const getGallery = createSelector([
  (state: RootState, statusIds: string[]) => statusIds,
  (state: RootState) => state.statuses,
], (statusIds, statuses) =>
  statusIds.reduce((medias: Array<AccountGalleryAttachment>, statusId: string) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map((media, index) => ({
        ...media,
        index,
        sensitive: status.sensitive,
        visibility: status.visibility,
        status_id: statusId,
        account_id: status.account.id,
      })));
  }, []),
);

const useAccountGallery = (accountId: string) => {
  const result = useAccountMediaTimeline(accountId);

  return {
    ...result,
    data: useAppSelector((state) => getGallery(state, result.data || [])),
  };
};

const useGroupGallery = (groupId: string) => {
  const result = useGroupMediaTimeline(groupId);

  return {
    ...result,
    data: useAppSelector((state) => getGallery(state, result.data || [])),
  };
};

export { useAccountGallery, useGroupGallery, type AccountGalleryAttachment };
