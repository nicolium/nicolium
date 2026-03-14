import { defineMessages } from 'react-intl';

import { getClient } from '@/api';
import { useComposeStore } from '@/stores/compose';
import toast from '@/toast';

import { importEntities } from './importer';

import type { CreateEventParams, Location, MediaAttachment } from 'pl-api';

const messages = defineMessages({
  exceededImageSizeLimit: {
    id: 'upload_error.image_size_limit',
    defaultMessage: 'Image exceeds the current file size limit ({limit})',
  },
  success: { id: 'compose_event.submit_success', defaultMessage: 'Your event was created' },
  editSuccess: { id: 'compose_event.edit_success', defaultMessage: 'Your event was edited' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  authorized: {
    id: 'compose_event.participation_requests.authorize_success',
    defaultMessage: 'User accepted',
  },
  rejected: {
    id: 'compose_event.participation_requests.reject_success',
    defaultMessage: 'User rejected',
  },
});

const submitEvent = async ({
  statusId,
  name,
  status,
  banner,
  startTime,
  endTime,
  joinMode,
  location,
}: {
  statusId: string | null;
  name: string;
  status: string;
  banner: MediaAttachment | null;
  startTime: Date;
  endTime: Date | null;
  joinMode: 'restricted' | 'free';
  location: Location | null;
}) => {
  if (!name || !name.length) {
    return;
  }

  const params: CreateEventParams = {
    name,
    status,
    start_time: startTime.toISOString(),
    join_mode: joinMode,
    content_type: 'text/markdown',
  };

  if (endTime) params.end_time = endTime?.toISOString();
  if (banner) params.banner_id = banner.id;
  if (location) params.location_id = location.origin_id;

  const data = await (statusId === null
    ? getClient().events.createEvent(params)
    : getClient().events.editEvent(statusId, params));

  importEntities({ statuses: [data] });
  toast.success(statusId ? messages.editSuccess : messages.success, {
    actionLabel: messages.view,
    actionLinkOptions: {
      to: '/@{$username}/events/$statusId',
      params: { username: data.account.acct, statusId: data.id },
    },
  });

  return data;
};

// todo: move to compose store?
const cancelEventCompose = () => {
  useComposeStore.getState().actions.updateCompose('event-compose-modal', (draft) => {
    draft.text = '';
  });
};

const initEventEdit = (statusId: string) => {
  return getClient()
    .statuses.getStatusSource(statusId)
    .then((response) => {
      useComposeStore
        .getState()
        .actions.updateCompose(`compose-event-modal-${statusId}`, (draft) => {
          draft.text = response.text;
        });
      return response;
    });
};

export { submitEvent, cancelEventCompose, initEventEdit };
