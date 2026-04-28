import * as v from 'valibot';

import {
  backupSchema,
  credentialAccountSchema,
  interactionPoliciesSchema,
  oauthTokenSchema,
  tokenSchema,
} from '@/entities';
import { coerceObject, filteredArray } from '@/entities/utils';
import { GOTOSOCIAL, ICESHRIMP_NET, MITRA, PIXELFED } from '@/features';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreateAccountParams,
  UpdateCredentialsParams,
  UpdateInteractionPoliciesParams,
  UpdateNotificationSettingsParams,
} from '@/params/settings';
import type { EmptyObject } from '@/utils/types';

const settings = (client: PlApiBaseClient) => ({
  /**
   * Register an account
   * Creates a user and account records. Returns an account access token for the app that initiated the request. The app should save this token for later, and should wait for the user to confirm their account by clicking a link in their email inbox.
   *
   * Requires features{@link Features.accountCreation}
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#create}
   */
  createAccount: async (params: CreateAccountParams) => {
    const response = await client.request('/api/v1/accounts', {
      method: 'POST',
      body: { language: params.locale, birthday: params.date_of_birth, ...params },
    });

    if ('identifier' in response.json)
      return v.parse(
        v.object({
          message: v.string(),
          identifier: v.string(),
        }),
        response.json,
      );
    return v.parse(tokenSchema, response.json);
  },

  /**
   * Verify account credentials
   * Test to make sure that the user token works.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#verify_credentials}
   */
  verifyCredentials: async () => {
    const response = await client.request('/api/v1/accounts/verify_credentials');
    const credentialAccount = v.parse(credentialAccountSchema, response.json);

    if (client.features.version.software === ICESHRIMP_NET) {
      await client.getIceshrimpAccessToken();
      try {
        const iceshrimpResponse = await client.request<{
          isAdmin: boolean;
          isModerator: boolean;
        }>('/api/iceshrimp/auth');

        credentialAccount.is_admin = iceshrimpResponse.json.isAdmin;
        credentialAccount.is_moderator = iceshrimpResponse.json.isModerator;
      } catch {}
    }

    return credentialAccount;
  },

  /**
   * Update account credentials
   * Update the user’s display and preferences.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#update_credentials}
   */
  updateCredentials: async (params: UpdateCredentialsParams) => {
    if (params.background_image) {
      (params as any).pleroma_background_image = params.background_image;
      delete params.background_image;
    }

    if (params.settings_store) {
      (params as any).pleroma_settings_store = params.settings_store;

      if (client.features.version.software === MITRA) {
        await client.request('/api/v1/settings/client_config', {
          method: 'POST',
          body: params.settings_store,
        });
      }

      delete params.settings_store;
    }

    const response = await client.request('/api/v1/accounts/update_credentials', {
      method: 'PATCH',
      formData: !!(
        client.features.version.software === GOTOSOCIAL ||
        client.features.version.software === ICESHRIMP_NET ||
        params.avatar ||
        params.header
      ),
      body: params,
    });

    return v.parse(credentialAccountSchema, response.json);
  },

  /**
   * Delete profile avatar
   * Deletes the avatar associated with the user’s profile.
   * @see {@link https://docs.joinmastodon.org/methods/profile/#delete-profile-avatar}
   */
  deleteAvatar: async () => {
    const response = await client.request('/api/v1/profile/avatar', { method: 'DELETE' });

    return v.parse(credentialAccountSchema, response.json);
  },

  /**
   * Delete profile header
   * Deletes the header image associated with the user’s profile.
   * @see {@link https://docs.joinmastodon.org/methods/profile/#delete-profile-header}
   */
  deleteHeader: async () => {
    const response = await client.request('/api/v1/profile/header', { method: 'DELETE' });

    return v.parse(credentialAccountSchema, response.json);
  },

  /**
   * View user preferences
   * Preferences defined by the user in their account settings.
   * @see {@link https://docs.joinmastodon.org/methods/preferences/#get}
   */
  getPreferences: async () => {
    const response = await client.request('/api/v1/preferences');

    return response.json as Record<string, any>;
  },

  /**
   * Create a user backup archive
   *
   * Requires features{@link Features.accountBackups}.
   */
  createBackup: async () => {
    const response = await client.request('/api/v1/pleroma/backups', { method: 'POST' });

    return v.parse(backupSchema, response.json);
  },

  /**
   * List user backups
   *
   * Requires features{@link Features.accountBackups}.
   */
  getBackups: async () => {
    const response = await client.request('/api/v1/pleroma/backups');

    return v.parse(filteredArray(backupSchema), response.json);
  },

  /**
   * Get aliases of the current account
   *
   * Requires features{@link Features.manageAccountAliases}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-aliases-of-the-current-account}
   */
  getAccountAliases: async () => {
    const response = await client.request('/api/pleroma/aliases');

    return v.parse(v.object({ aliases: filteredArray(v.string()) }), response.json);
  },

  /**
   * Add alias to the current account
   *
   * Requires features{@link Features.manageAccountAliases}.
   * @param alias - the nickname of the alias to add, e.g. foo@example.org.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#add-alias-to-the-current-account}
   */
  addAccountAlias: async (alias: string) => {
    const response = await client.request('/api/pleroma/aliases', {
      method: 'PUT',
      body: { alias },
    });

    return v.parse(v.object({ status: v.literal('success') }), response.json);
  },

  /**
   * Delete alias from the current account
   *
   * Requires features{@link Features.manageAccountAliases}.
   * @param alias - the nickname of the alias to add, e.g. foo@example.org.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-alias-from-the-current-account}
   */
  deleteAccountAlias: async (alias: string) => {
    const response = await client.request('/api/pleroma/aliases', {
      method: 'DELETE',
      body: { alias },
    });

    return v.parse(v.object({ status: v.literal('success') }), response.json);
  },

  /**
   * Retrieve a list of active sessions for the user
   *
   * Requires features{@link Features.sessions}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens}
   */
  getOauthTokens: () => {
    let url;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        url = '/api/v1/tokens';
        break;
      case MITRA:
        url = '/api/v1/settings/sessions';
        break;
      default:
        url = '/api/oauth_tokens';
        break;
    }

    return client.paginatedGet(url, {}, oauthTokenSchema);
  },

  /**
   * Revoke a user session by its ID
   *
   * Requires features{@link Features.sessions}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apioauth_tokensid}
   */
  deleteOauthToken: async (oauthTokenId: string) => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request<EmptyObject>(`/api/v1/tokens/${oauthTokenId}/invalidate`, {
          method: 'POST',
        });
        break;
      case MITRA:
        response = await client.request<EmptyObject>(`/api/v1/settings/sessions/${oauthTokenId}`, {
          method: 'DELETE',
        });
        break;
      default:
        response = await client.request<EmptyObject>(`/api/oauth_tokens/${oauthTokenId}`, {
          method: 'DELETE',
        });
        break;
    }

    return response.json;
  },

  /**
   * Change account password
   *
   * Requires features{@link Features.changePassword}.
   * @see {@link https://docs.gotosocial.org/en/latest/api/swagger}
   * @see {@link https://codeberg.org/silverpill/mitra/src/commit/f15c19527191d82bc3643f984deca43d1527525d/docs/openapi.yaml}
   * @see {@link https://git.pleroma.social/pleroma/pleroma/-/blob/develop/lib/pleroma/web/api_spec/operations/twitter_util_operation.ex?ref_type=heads#L68}
   */
  changePassword: async (current_password: string, new_password: string) => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request<EmptyObject>('/api/v1/user/password_change', {
          method: 'POST',
          body: {
            old_password: current_password,
            new_password,
          },
        });
        break;
      case ICESHRIMP_NET:
        await client.getIceshrimpAccessToken();
        response = await client.request<EmptyObject>('/api/iceshrimp/auth/change-password', {
          method: 'POST',
          body: {
            oldPassword: current_password,
            newPassword: new_password,
          },
        });
        break;
      case MITRA:
        response = await client.request<EmptyObject>('/api/v1/settings/change_password', {
          method: 'POST',
          body: { new_password },
        });
        break;
      case PIXELFED:
        response = await client.request<EmptyObject>('/api/v1.1/accounts/change-password', {
          method: 'POST',
          body: {
            current_password,
            new_password,
            confirm_password: new_password,
          },
        });
        if (response.redirected) throw response;
        break;
      default:
        response = await client.request<EmptyObject>('/api/pleroma/change_password', {
          method: 'POST',
          body: {
            password: current_password,
            new_password,
            new_password_confirmation: new_password,
          },
        });
    }

    return response.json;
  },

  /**
   * Request password reset e-mail
   *
   * Requires features{@link Features.resetPassword}.
   */
  resetPassword: async (email?: string, nickname?: string) => {
    const response = await client.request<EmptyObject>('/auth/password', {
      method: 'POST',
      body: { email, nickname },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.changeEmail}.
   */
  changeEmail: async (email: string, password: string) => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request<EmptyObject>('/api/v1/user/email_change', {
          method: 'POST',
          body: {
            new_email: email,
            password,
          },
        });
        break;
      default:
        response = await client.request<EmptyObject>('/api/pleroma/change_email', {
          method: 'POST',
          body: {
            email,
            password,
          },
        });
    }

    if (response.json?.error) throw response.json.error;

    return response.json;
  },

  /**
   * Requires features{@link Features.deleteAccount}.
   */
  deleteAccount: async (password: string) => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request<EmptyObject>('/api/v1/accounts/delete', {
          method: 'POST',
          body: { password },
        });
        break;
      default:
        response = await client.request<EmptyObject>('/api/pleroma/delete_account', {
          method: 'POST',
          body: { password },
        });
    }

    if (response.json?.error) throw response.json.error;

    return response.json;
  },

  /**
   * Requires features{@link Features.deleteAccountWithoutPassword}.
   */
  deleteAccountWithoutPassword: async () => {
    const response = await client.request<EmptyObject>('/api/v1/settings/delete_account', {
      method: 'POST',
    });

    return response.json;
  },

  /**
   * Disable an account
   *
   * Requires features{@link Features.disableAccount}.
   */
  disableAccount: async (password: string) => {
    const response = await client.request<EmptyObject>('/api/pleroma/disable_account', {
      method: 'POST',
      body: { password },
    });

    if (response.json?.error) throw response.json.error;

    return response.json;
  },

  /**
   * Requires features{@link Features.accountMoving}.
   */
  moveAccount: async (target_account: string, password: string) => {
    const response = await client.request<EmptyObject>('/api/pleroma/move_account', {
      method: 'POST',
      body: { password, target_account },
    });

    if (response.json?.error) throw response.json.error;

    return response.json;
  },

  mfa: {
    /**
     * Requires features{@link Features.manageMfa}.
     */
    getMfaSettings: async () => {
      let response;

      switch (client.features.version.software) {
        case GOTOSOCIAL:
          response = await client.request('/api/v1/user').then(({ json }) => ({
            settings: {
              enabled: !!json?.two_factor_enabled_at,
              totp: !!json?.two_factor_enabled_at,
            },
          }));
          break;
        default:
          response = (await client.request('/api/pleroma/accounts/mfa')).json;
      }

      return v.parse(
        v.object({
          settings: coerceObject({
            enabled: v.boolean(),
            totp: v.boolean(),
          }),
        }),
        response,
      );
    },

    /**
     * Requires features{@link Features.manageMfa}.
     */
    getMfaBackupCodes: async () => {
      const response = await client.request('/api/pleroma/accounts/mfa/backup_codes');

      return v.parse(
        v.object({
          codes: v.array(v.string()),
        }),
        response.json,
      );
    },

    /**
     * Requires features{@link Features.manageMfa}.
     */
    getMfaSetup: async (method: 'totp') => {
      let response;

      switch (client.features.version.software) {
        case GOTOSOCIAL:
          response = await client.request('/api/v1/user/2fa/qruri').then(({ data }) => ({
            provisioning_uri: data,
            key: new URL(data).searchParams.get('secret'),
          }));
          break;
        default:
          response = (await client.request(`/api/pleroma/accounts/mfa/setup/${method}`)).json;
      }

      return v.parse(
        v.object({
          key: v.fallback(v.string(), ''),
          provisioning_uri: v.string(),
        }),
        response,
      );
    },

    /**
     * Requires features{@link Features.manageMfa}.
     */
    confirmMfaSetup: async (method: 'totp', code: string, password: string) => {
      let response;

      switch (client.features.version.software) {
        case GOTOSOCIAL:
          response = await client.request('/api/v1/user/2fa/enable', {
            method: 'POST',
            body: { code },
          });
          break;
        default:
          response = (
            await client.request(`/api/pleroma/accounts/mfa/confirm/${method}`, {
              method: 'POST',
              body: { code, password },
            })
          ).json;
      }

      if (response?.error) throw response.error;

      return response as EmptyObject;
    },

    /**
     * Requires features{@link Features.manageMfa}.
     */
    disableMfa: async (method: 'totp', password: string) => {
      let response;

      switch (client.features.version.software) {
        case GOTOSOCIAL:
          response = await client.request<EmptyObject>('/api/v1/user/2fa/disable', {
            method: 'POST',
            body: { password },
          });
          break;
        default:
          response = await client.request<EmptyObject>(`/api/pleroma/accounts/mfa/${method}`, {
            method: 'DELETE',
            body: { password },
          });
      }

      if (response.json?.error) throw response.json.error;

      return response.json;
    },
  },

  /**
   * Imports your follows, for example from a Mastodon CSV file.
   *
   * Requires features{@link Features.importFollows}.
   * `overwrite` mode requires features{@link Features.importOverwrite}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromafollow_import}
   */
  importFollows: async (list: File | string, mode?: 'merge' | 'overwrite') => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request('/api/v1/import', {
          method: 'POST',
          body: { data: list, type: 'following', mode },
          formData: true,
        });
        break;
      case MITRA:
        response = await client.request('/api/v1/settings/import_follows', {
          method: 'POST',
          body: { follows_csv: typeof list === 'string' ? list : await list.text() },
        });
        break;
      default:
        response = await client.request('/api/pleroma/follow_import', {
          method: 'POST',
          body: { list },
          formData: true,
        });
    }

    return response.json;
  },

  /**
   * Move followers from remote alias. (experimental?)
   *
   * Requires features{@link Features.importFollowers}.
   */
  importFollowers: async (list: File | string, actorId: string) => {
    const response = await client.request('/api/v1/settings/import_followers', {
      method: 'POST',
      body: {
        from_actor_id: actorId,
        followers_csv: typeof list === 'string' ? list : await list.text(),
      },
    });

    return response.json;
  },

  /**
   * Imports your blocks.
   *
   * Requires features{@link Features.importBlocks}.
   * `overwrite` mode requires features{@link Features.importOverwrite}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromablocks_import}
   */
  importBlocks: async (list: File | string, mode?: 'merge' | 'overwrite') => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request('/api/v1/import', {
          method: 'POST',
          body: { data: list, type: 'blocks', mode },
          formData: true,
        });
        break;
      default:
        response = await client.request('/api/pleroma/blocks_import', {
          method: 'POST',
          body: { list },
          formData: true,
        });
    }

    return response.json;
  },

  /**
   * Imports your mutes.
   *
   * Requires features{@link Features.importMutes}.
   * `overwrite` mode requires features{@link Features.importOverwrite}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromamutes_import}
   */
  importMutes: async (list: File | string, mode?: 'merge' | 'overwrite') => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request('/api/v1/import', {
          method: 'POST',
          body: { data: list, type: 'blocks', mode },
          formData: true,
        });
        break;
      default:
        response = await client.request('/api/pleroma/mutes_import', {
          method: 'POST',
          body: { list },
          formData: true,
        });
    }

    return response.json;
  },

  /**
   * Export followers to CSV file
   *
   * Requires features{@link Features.exportFollowers}.
   */
  exportFollowers: async () => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request('/api/v1/exports/followers.csv', {
          method: 'GET',
        });
        break;
      default:
        response = await client.request('/api/v1/settings/export_followers', {
          method: 'GET',
        });
    }

    return response.data;
  },

  /**
   * Export follows to CSV file
   *
   * Requires features{@link Features.exportFollows}.
   */
  exportFollows: async () => {
    let response;

    switch (client.features.version.software) {
      case GOTOSOCIAL:
        response = await client.request('/api/v1/exports/following.csv', {
          method: 'GET',
        });
        break;
      default:
        response = await client.request('/api/v1/settings/export_follows', {
          method: 'GET',
        });
    }

    return response.data;
  },

  /**
   * Export lists to CSV file
   *
   * Requires features{@link Features.exportLists}.
   */
  exportLists: async () => {
    const response = await client.request('/api/v1/exports/lists.csv', {
      method: 'GET',
    });

    return response.data;
  },

  /**
   * Export blocks to CSV file
   *
   * Requires features{@link Features.exportBlocks}.
   */
  exportBlocks: async () => {
    const response = await client.request('/api/v1/exports/blocks.csv', {
      method: 'GET',
    });

    return response.data;
  },

  /**
   * Export mutes to CSV file
   *
   * Requires features{@link Features.exportMutes}.
   */
  exportMutes: async () => {
    const response = await client.request('/api/v1/exports/mutes.csv', {
      method: 'GET',
    });

    return response.data;
  },

  /**
   * Updates user notification settings
   *
   * Requires features{@link Features.muteStrangers}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apipleromanotification_settings}
   */
  updateNotificationSettings: async (params: UpdateNotificationSettingsParams) => {
    const response = await client.request('/api/pleroma/notification_settings', {
      method: 'PUT',
      body: params,
    });

    if (response.json?.error) throw response.json.error;

    return v.parse(v.object({ status: v.string() }), response.json);
  },

  /**
   * Get default interaction policies for new statuses created by you.
   *
   * Requires features{@link Features.interactionRequests}.
   * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
   */
  getInteractionPolicies: async () => {
    const response = await client.request('/api/v1/interaction_policies/defaults');

    return v.parse(interactionPoliciesSchema, response.json);
  },

  /**
   * Update default interaction policies per visibility level for new statuses created by you.
   *
   * Requires features{@link Features.interactionRequests}.
   * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
   */
  updateInteractionPolicies: async (params: UpdateInteractionPoliciesParams) => {
    const response = await client.request('/api/v1/interaction_policies/defaults', {
      method: 'PATCH',
      body: params,
    });

    return v.parse(interactionPoliciesSchema, response.json);
  },

  /**
   * List frontend setting profiles
   *
   * Requires features{@link Features.preferredFrontends}.
   */
  getAvailableFrontends: async () => {
    const response = await client.request('/api/v1/akkoma/preferred_frontend/available');

    return v.parse(v.array(v.string()), response.json);
  },

  /**
   * Update preferred frontend setting
   *
   * Store preferred frontend in cookies
   *
   * Requires features{@link Features.preferredFrontends}.
   */
  setPreferredFrontend: async (frontendName: string) => {
    const response = await client.request('/api/v1/akkoma/preferred_frontend', {
      method: 'PUT',
      body: { frontend_name: frontendName },
    });

    return v.parse(v.object({ frontend_name: v.string() }), response.json);
  },

  authorizeIceshrimp: async () => {
    const response = await client.request<string>('/api/v1/accounts/authorize_iceshrimp', {
      method: 'POST',
    });

    return response.json;
  },
});

export { settings };
