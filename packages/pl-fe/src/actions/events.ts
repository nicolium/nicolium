import { defineMessages } from 'react-intl';

import { getClient } from '@/api';
import toast from '@/toast';

import { importEntities } from './importer';
import {
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
} from './statuses';

import type { AppDispatch, RootState } from '@/store';
import type { CreateEventParams, Location, MediaAttachment, Status } from 'pl-api';

const EVENT_JOIN_REQUEST = 'EVENT_JOIN_REQUEST' as const;
const EVENT_JOIN_FAIL = 'EVENT_JOIN_FAIL' as const;

const EVENT_LEAVE_REQUEST = 'EVENT_LEAVE_REQUEST' as const;
const EVENT_LEAVE_FAIL = 'EVENT_LEAVE_FAIL' as const;

const EVENT_COMPOSE_CANCEL = 'EVENT_COMPOSE_CANCEL' as const;

const EVENT_FORM_SET = 'EVENT_FORM_SET' as const;

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

const submitEvent =
  ({
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
  }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

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
      ? getClient(state).events.createEvent(params)
      : getClient(state).events.editEvent(statusId, params));

    dispatch(importEntities({ statuses: [data] }));
    toast.success(statusId ? messages.editSuccess : messages.success, {
      actionLabel: messages.view,
      actionLinkOptions: {
        to: '/@{$username}/events/$statusId',
        params: { username: data.account.acct, statusId: data.id },
      },
    });

    return data;
  };

interface JoinEventRequest {
  type: typeof EVENT_JOIN_REQUEST;
  statusId: string;
}

interface JoinEventFail {
  type: typeof EVENT_JOIN_FAIL;
  error: unknown;
  statusId: string;
  previousState: Exclude<Status['event'], null>['join_state'] | null;
}

interface LeaveEventRequest {
  type: typeof EVENT_LEAVE_REQUEST;
  statusId: string;
}

interface LeaveEventFail {
  type: typeof EVENT_LEAVE_FAIL;
  statusId: string;
  error: unknown;
  previousState: Exclude<Status['event'], null>['join_state'] | null;
}

const fetchEventIcs = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).events.getEventIcs(statusId);

const cancelEventCompose = () => ({
  type: EVENT_COMPOSE_CANCEL,
});

interface EventFormSetAction {
  type: typeof EVENT_FORM_SET;
  composeId: string;
  text: string;
}

const initEventEdit = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST, statusId });

  return getClient(getState())
    .statuses.getStatusSource(statusId)
    .then((response) => {
      dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS, statusId });
      dispatch<EventFormSetAction>({
        type: EVENT_FORM_SET,
        composeId: `compose-event-modal-${statusId}`,
        text: response.text,
      });
      return response;
    })
    .catch((error) => {
      dispatch({ type: STATUS_FETCH_SOURCE_FAIL, statusId, error });
    });
};

type EventsAction =
  | JoinEventRequest
  | JoinEventFail
  | LeaveEventRequest
  | LeaveEventFail
  | ReturnType<typeof cancelEventCompose>
  | EventFormSetAction;

export {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
  EVENT_COMPOSE_CANCEL,
  EVENT_FORM_SET,
  submitEvent,
  fetchEventIcs,
  cancelEventCompose,
  initEventEdit,
  type EventsAction,
};
