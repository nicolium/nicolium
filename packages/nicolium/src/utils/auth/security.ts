/**
 * Security: Pleroma-specific account management features.
 * @module @/actions/security
 * @see module:@/actions/auth
 */

import { messages } from '@/stores/auth';
import toast from '@/toast';
import { normalizeUsername } from '@/utils/input';

import type { PlApiClient } from 'pl-api';

const resetPassword = (client: PlApiClient, usernameOrEmail: string) => {
  const input = normalizeUsername(usernameOrEmail);
  return client.settings.resetPassword(
    input.includes('@') ? input : undefined,
    input.includes('@') ? undefined : input,
  );
};

const deleteAccount = async (client: PlApiClient, password: string, account: { url: string }) => {
  const { removeAccount } = await import('@/stores/auth');

  await (client.features.deleteAccount
    ? client.settings.deleteAccount(password)
    : client.settings.deleteAccountWithoutPassword());

  removeAccount(account);
  toast.success(messages.loggedOut);
};

export { resetPassword, deleteAccount };
