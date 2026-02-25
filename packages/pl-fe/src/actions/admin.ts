import { importEntities } from '@/actions/importer';
import { queryClient } from '@/queries/client';
import { useComposeStore } from '@/stores/compose';
import { useModalsStore } from '@/stores/modals';
import { filterBadges, getTagDiff } from '@/utils/badges';

import { getClient } from '../api';

import { STATUS_FETCH_SOURCE_FAIL, type StatusesAction } from './statuses';
import { deleteFromTimelines } from './timelines';

import type { AppDispatch, RootState } from '@/store';
import type { PleromaConfig, Poll } from 'pl-api';

const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS' as const;

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST' as const;
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS' as const;

const fetchConfig = () => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState)
    .admin.config.getPleromaConfig()
    .then((data) => {
      dispatch<AdminActions>({
        type: ADMIN_CONFIG_FETCH_SUCCESS,
        configs: data.configs,
        needsReboot: data.need_reboot,
      });
    });

const updateConfig =
  (configs: PleromaConfig['configs']) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<AdminActions>({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return getClient(getState)
      .admin.config.updatePleromaConfig(configs)
      .then((data) => {
        dispatch<AdminActions>({
          type: ADMIN_CONFIG_UPDATE_SUCCESS,
          configs: data.configs,
          needsReboot: data.need_reboot,
        });
      });
  };

const updateFrontendConfig = (data: Record<string, any>) => (dispatch: AppDispatch) => {
  const params = [
    {
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [
        {
          tuple: [':pl_fe', data],
        },
      ],
    },
  ];

  return dispatch(updateConfig(params));
};

const deactivateUser =
  (accountId: string, report_id?: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    return getClient(state).admin.accounts.performAccountAction(accountId, 'suspend', {
      report_id,
    });
  };

const deleteUser = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).admin.accounts.deleteAccount(accountId);

const deleteStatus = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState)
    .admin.statuses.deleteStatus(statusId)
    .then(() => {
      dispatch(deleteFromTimelines(statusId));
      return { statusId };
    });

const toggleStatusSensitivity =
  (statusId: string, sensitive: boolean) => (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState)
      .admin.statuses.updateStatus(statusId, { sensitive: !sensitive })
      .then((status) => {
        dispatch(importEntities({ statuses: [status] }));
      });

const tagUser =
  (accountId: string, tags: string[]) => (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.tagUser(accountId, tags);

const untagUser =
  (accountId: string, tags: string[]) => (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.untagUser(accountId, tags);

/** Synchronizes user tags to the backend. */
const setTags =
  (accountId: string, oldTags: string[], newTags: string[]) => async (dispatch: AppDispatch) => {
    const diff = getTagDiff(oldTags, newTags);

    if (diff.added.length) await dispatch(tagUser(accountId, diff.added));
    if (diff.removed.length) await dispatch(untagUser(accountId, diff.removed));
  };

/** Synchronizes badges to the backend. */
const setBadges =
  (accountId: string, oldTags: string[], newTags: string[]) => (dispatch: AppDispatch) => {
    const oldBadges = filterBadges(oldTags);
    const newBadges = filterBadges(newTags);

    return dispatch(setTags(accountId, oldBadges, newBadges));
  };

const promoteToAdmin = (accountId: string) => (_dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).admin.accounts.promoteToAdmin(accountId);

const promoteToModerator =
  (accountId: string) => (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.promoteToModerator(accountId);

const demoteToUser = (accountId: string) => (_dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).admin.accounts.demoteToUser(accountId);

const setRole =
  (accountId: string, role: 'user' | 'moderator' | 'admin') => (dispatch: AppDispatch) => {
    switch (role) {
      case 'user':
        return dispatch(demoteToUser(accountId));
      case 'moderator':
        return dispatch(promoteToModerator(accountId));
      case 'admin':
        return dispatch(promoteToAdmin(accountId));
    }
  };

const redactStatus = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();

  const status = state.statuses[statusId];
  const poll = status.poll_id
    ? queryClient.getQueryData<Poll>(['statuses', 'polls', status.poll_id])
    : undefined;

  return getClient(state)
    .statuses.getStatusSource(statusId)
    .then((source) => {
      useComposeStore
        .getState()
        .actions.setComposeToStatus(status, poll, source, false, null, null, true);
      useModalsStore.getState().actions.openModal('COMPOSE');
    })
    .catch((error) => {
      dispatch<StatusesAction>({ type: STATUS_FETCH_SOURCE_FAIL, error });
    });
};

type AdminActions =
  | {
      type: typeof ADMIN_CONFIG_FETCH_SUCCESS;
      configs: PleromaConfig['configs'];
      needsReboot: boolean;
    }
  | { type: typeof ADMIN_CONFIG_UPDATE_REQUEST; configs: PleromaConfig['configs'] }
  | {
      type: typeof ADMIN_CONFIG_UPDATE_SUCCESS;
      configs: PleromaConfig['configs'];
      needsReboot: boolean;
    };

export {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_REQUEST,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  fetchConfig,
  updateConfig,
  updateFrontendConfig,
  deactivateUser,
  deleteUser,
  deleteStatus,
  toggleStatusSensitivity,
  setBadges,
  setRole,
  redactStatus,
  type AdminActions,
};
