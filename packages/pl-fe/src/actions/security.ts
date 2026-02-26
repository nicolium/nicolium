/**
 * Security: Pleroma-specific account management features.
 * @module @/actions/security
 * @see module:@/actions/auth
 */

import { getClient } from '@/api';
import toast from '@/toast';
import { getLoggedInAccount } from '@/utils/auth';
import { normalizeUsername } from '@/utils/input';

import { AUTH_LOGGED_OUT, messages } from './auth';

import type { AppDispatch, RootState } from '@/store';
import type { Account } from 'pl-api';

const changePassword =
  (oldPassword: string, newPassword: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changePassword(oldPassword, newPassword);

const resetPassword =
  (usernameOrEmail: string) => (_dispatch: AppDispatch, getState: () => RootState) => {
    const input = normalizeUsername(usernameOrEmail);

    return getClient(getState).settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    );
  };

const changeEmail =
  (email: string, password: string) => (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.changeEmail(email, password);

const deleteAccount = (password: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const account = getLoggedInAccount(getState())!;

  const client = getClient(getState);

  return (
    client.features.deleteAccount
      ? client.settings.deleteAccount(password)
      : client.settings.deleteAccountWithoutPassword()
  ).then(() => {
    dispatch<SecurityAction>({ type: AUTH_LOGGED_OUT, account });
    toast.success(messages.loggedOut);
  });
};

const moveAccount =
  (targetAccount: string, password: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).settings.moveAccount(targetAccount, password);

type SecurityAction = { type: typeof AUTH_LOGGED_OUT; account: Account };

export {
  changePassword,
  resetPassword,
  changeEmail,
  deleteAccount,
  moveAccount,
  type SecurityAction,
};
