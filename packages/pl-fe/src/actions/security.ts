/**
 * Security: Pleroma-specific account management features.
 * @module pl-fe/actions/security
 * @see module:pl-fe/actions/auth
 */

import { getClient } from 'pl-fe/api';
import toast from 'pl-fe/toast';
import { getLoggedInAccount } from 'pl-fe/utils/auth';
import { normalizeUsername } from 'pl-fe/utils/input';

import { AUTH_LOGGED_OUT, messages } from './auth';

import type { Account } from 'pl-fe/normalizers/account';
import type { AppDispatch, RootState } from 'pl-fe/store';

const changePassword = (oldPassword: string, newPassword: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changePassword(oldPassword, newPassword);

const resetPassword = (usernameOrEmail: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const input = normalizeUsername(usernameOrEmail);

    return getClient(getState).settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    );
  };

const changeEmail = (email: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changeEmail(email, password);

const deleteAccount = (password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = getLoggedInAccount(getState())!;

    return getClient(getState).settings.deleteAccount(password).then(() => {
      dispatch<SecurityAction>({ type: AUTH_LOGGED_OUT, account });
      toast.success(messages.loggedOut);
    });
  };

const moveAccount = (targetAccount: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.moveAccount(targetAccount, password);

type SecurityAction = { type: typeof AUTH_LOGGED_OUT; account: Account }

export {
  changePassword,
  resetPassword,
  changeEmail,
  deleteAccount,
  moveAccount,
  type SecurityAction,
};
