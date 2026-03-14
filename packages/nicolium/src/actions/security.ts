/**
 * Security: Pleroma-specific account management features.
 * @module @/actions/security
 * @see module:@/actions/auth
 */

import { selectOwnAccount } from '@/queries/accounts/selectors';
import { useAuthStore } from '@/stores/auth';
import toast from '@/toast';
import { normalizeUsername } from '@/utils/input';

import { messages } from './auth';

const changePassword = (oldPassword: string, newPassword: string) =>
  useAuthStore.getState().client.settings.changePassword(oldPassword, newPassword);

const resetPassword = (usernameOrEmail: string) => {
  const input = normalizeUsername(usernameOrEmail);
  return useAuthStore
    .getState()
    .client.settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    );
};

const changeEmail = (email: string, password: string) =>
  useAuthStore.getState().client.settings.changeEmail(email, password);

const deleteAccount = async (password: string) => {
  const account = selectOwnAccount()!;
  const client = useAuthStore.getState().client;

  await (client.features.deleteAccount
    ? client.settings.deleteAccount(password)
    : client.settings.deleteAccountWithoutPassword());

  useAuthStore.getState().actions.removeToken(account);
  toast.success(messages.loggedOut);
};

const moveAccount = (targetAccount: string, password: string) =>
  useAuthStore.getState().client.settings.moveAccount(targetAccount, password);

export { changePassword, resetPassword, changeEmail, deleteAccount, moveAccount };
