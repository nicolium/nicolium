import { useMemo } from 'react';

import { useStatuses } from '@/queries/statuses/use-status';
import {
  useAccountMediaTimeline,
  useGroupMediaTimeline,
} from '@/queries/timelines/use-account-media-timeline';

import type { NormalizedStatus } from '@/queries/statuses/normalize';
import type { MediaAttachment } from 'pl-api';

type AccountGalleryAttachment = MediaAttachment & {
  index: number;
  sensitive: boolean;
  visibility: string;
  status_id: string;
  account_id: string;
};

const buildGallery = (
  statuses: Array<
    Pick<
      NormalizedStatus,
      'id' | 'account_id' | 'sensitive' | 'visibility' | 'media_attachments' | 'reblog_id'
    >
  > = [],
) =>
  statuses.reduce((medias: Array<AccountGalleryAttachment>, status) => {
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map((media, index) => ({
        ...media,
        index,
        sensitive: status.sensitive,
        visibility: status.visibility,
        status_id: status.id,
        account_id: status.account_id,
      })),
    );
  }, []);

const useAccountGallery = (accountId: string) => {
  const { data: statusIds, ...result } = useAccountMediaTimeline(accountId);
  const statusesQueries = useStatuses(statusIds ?? []);
  const statusesData = statusesQueries.map((query) => query.data);

  return {
    ...result,
    data: useMemo(
      () => buildGallery(statusesData.filter((s): s is NormalizedStatus => !!s)),
      [statusesData],
    ),
  };
};

const useGroupGallery = (groupId: string) => {
  const { data: statusIds, ...result } = useGroupMediaTimeline(groupId);
  const statusesQueries = useStatuses(statusIds ?? []);
  const statusesData = statusesQueries.map((query) => query.data);

  return {
    ...result,
    data: useMemo(
      () => buildGallery(statusesData.filter((s): s is NormalizedStatus => !!s)),
      [statusesData],
    ),
  };
};

export { useAccountGallery, useGroupGallery, type AccountGalleryAttachment };
