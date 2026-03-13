import { getClient } from '@/api';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useComposeStore } from '@/stores/compose';
import { useModalsStore } from '@/stores/modals';
import { filterBadges, getTagDiff } from '@/utils/badges';

import type { AppDispatch, RootState } from '@/store';
import type { PleromaConfig } from 'pl-api';

const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS' as const;

const deactivateUser =
  (accountId: string, report_id?: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    return getClient(state).admin.accounts.performAccountAction(accountId, 'suspend', {
      report_id,
    });
  };

const deleteUser = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).admin.accounts.deleteAccount(accountId);

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
  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  return getClient(getState())
    .statuses.getStatusSource(statusId)
    .then((source) => {
      useComposeStore
        .getState()
        .actions.setComposeToStatus(status, poll, source, false, null, null, true);
      useModalsStore.getState().actions.openModal('COMPOSE');
    });
};

type AdminActions = {
  type: typeof ADMIN_CONFIG_UPDATE_SUCCESS;
  configs: PleromaConfig['configs'];
  needsReboot: boolean;
};

export {
  ADMIN_CONFIG_UPDATE_SUCCESS,
  deactivateUser,
  deleteUser,
  setBadges,
  setRole,
  redactStatus,
  type AdminActions,
};
