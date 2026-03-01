import * as v from 'valibot';

import {
  adminAccountSchema,
  adminAnnouncementSchema,
  adminCanonicalEmailBlockSchema,
  adminCohortSchema,
  adminCustomEmojiSchema,
  adminDimensionSchema,
  adminDomainAllowSchema,
  adminDomainBlockSchema,
  adminDomainSchema,
  adminEmailDomainBlockSchema,
  adminIpBlockSchema,
  adminMeasureSchema,
  adminModerationLogEntrySchema,
  adminRelaySchema,
  adminReportSchema,
  adminRuleSchema,
  adminTagSchema,
  pleromaConfigSchema,
  statusSchema,
  statusSourceSchema,
  trendsLinkSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';

import { GOTOSOCIAL, MITRA, PLEROMA } from '../features';
import { PaginatedResponse } from '../responses';

import type { PlApiBaseClient } from '@/client-base';
import type {
  AdminAccount,
  AdminAnnouncement,
  AdminModerationLogEntry,
  AdminReport,
  PleromaConfig,
  Status,
} from '@/entities';
import type {
  AdminAccountAction,
  AdminCreateAccountParams,
  AdminCreateAnnouncementParams,
  AdminCreateCustomEmojiParams,
  AdminCreateDomainBlockParams,
  AdminCreateDomainParams,
  AdminCreateIpBlockParams,
  AdminCreateRuleParams,
  AdminDimensionKey,
  AdminGetAccountsParams,
  AdminGetAnnouncementsParams,
  AdminGetCanonicalEmailBlocks,
  AdminGetCustomEmojisParams,
  AdminGetDimensionsParams,
  AdminGetDomainAllowsParams,
  AdminGetDomainBlocksParams,
  AdminGetEmailDomainBlocksParams,
  AdminGetIpBlocksParams,
  AdminGetMeasuresParams,
  AdminGetModerationLogParams,
  AdminGetReportsParams,
  AdminGetStatusesParams,
  AdminMeasureKey,
  AdminPerformAccountActionParams,
  AdminUpdateAnnouncementParams,
  AdminUpdateCustomEmojiParams,
  AdminUpdateDomainBlockParams,
  AdminUpdateReportParams,
  AdminUpdateRuleParams,
  AdminUpdateStatusParams,
} from '@/params/admin';
import type { EditStatusParams } from '@/params/statuses';
import type { EmptyObject } from '@/utils/types';

const paginatedPleromaAccounts = async (
  client: PlApiBaseClient,
  params: {
    query?: string;
    filters?: string;
    page?: number;
    page_size: number;
    tags?: Array<string>;
    actor_types?: Array<string>;
    name?: string;
    email?: string;
  },
): Promise<PaginatedResponse<AdminAccount>> => {
  const response = await client.request('/api/v1/pleroma/admin/users', { params });

  const adminAccounts = v.parse(filteredArray(adminAccountSchema), response.json?.users);

  return new PaginatedResponse(adminAccounts, {
    previous: params.page
      ? () => paginatedPleromaAccounts(client, { ...params, page: params.page! - 1 })
      : null,
    next:
      response.json?.count >
      params.page_size * ((params.page || 1) - 1) + response.json?.users?.length
        ? () => paginatedPleromaAccounts(client, { ...params, page: (params.page || 0) + 1 })
        : null,
    partial: response.status === 206,
    total: response.json?.count,
  });
};

const paginatedPleromaReports = async (
  client: PlApiBaseClient,
  params: {
    state?: 'open' | 'closed' | 'resolved';
    limit?: number;
    page?: number;
    page_size: number;
  },
): Promise<PaginatedResponse<AdminReport>> => {
  const response = await client.request('/api/v1/pleroma/admin/reports', { params });

  return new PaginatedResponse(v.parse(filteredArray(adminReportSchema), response.json?.reports), {
    previous: params.page
      ? () => paginatedPleromaReports(client, { ...params, page: params.page! - 1 })
      : null,
    next:
      response.json?.total >
      params.page_size * ((params.page || 1) - 1) + response.json?.reports?.length
        ? () => paginatedPleromaReports(client, { ...params, page: (params.page || 0) + 1 })
        : null,
    partial: response.status === 206,
    total: response.json?.total,
  });
};

const paginatedPleromaStatuses = async (
  client: PlApiBaseClient,
  params: {
    page_size?: number;
    local_only?: boolean;
    godmode?: boolean;
    with_reblogs?: boolean;
    page?: number;
  },
): Promise<PaginatedResponse<Status>> => {
  const response = await client.request('/api/v1/pleroma/admin/statuses', { params });

  return new PaginatedResponse(v.parse(filteredArray(statusSchema), response.json), {
    previous: params.page
      ? () => paginatedPleromaStatuses(client, { ...params, page: params.page! - 1 })
      : null,
    next: response.json?.length
      ? () => paginatedPleromaStatuses(client, { ...params, page: (params.page || 0) + 1 })
      : null,
    partial: response.status === 206,
  });
};

const admin = (client: PlApiBaseClient) => {
  const category = {
    /** Perform moderation actions with accounts. */
    accounts: {
      /**
       * View accounts
       * View all accounts, optionally matching certain criteria for filtering, up to 100 at a time.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#v2}
       */
      getAccounts: (params?: AdminGetAccountsParams) => {
        if (client.features.mastodonAdminV2) {
          return client.paginatedGet('/api/v2/admin/accounts', { params }, adminAccountSchema);
        }

        return paginatedPleromaAccounts(
          client,
          params
            ? {
                query: params.username,
                name: params.display_name,
                email: params.email,
                filters: [
                  params.origin === 'local' && 'local',
                  params.origin === 'remote' && 'external',
                  params.status === 'active' && 'active',
                  params.status === 'pending' && 'need_approval',
                  params.status === 'disabled' && 'deactivated',
                  params.permissions === 'staff' && 'is_admin',
                  params.permissions === 'staff' && 'is_moderator',
                ]
                  .filter((filter) => filter)
                  .join(','),
                page_size: 100,
              }
            : { page_size: 100 },
        );
      },

      /**
       * View a specific account
       * View admin-level information about the given account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#get-one}
       */
      getAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}`);
        } else {
          response = await client.request(`/api/v1/pleroma/admin/users/${accountId}`);
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Approve a pending account
       * Approve the given local account if it is currently pending approval.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#approve}
       */
      approveAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}/approve`, {
            method: 'POST',
          });
        } else {
          const account = await category.accounts.getAccount(accountId)!;

          response = await client.request('/api/v1/pleroma/admin/users/approve', {
            method: 'PATCH',
            body: { nicknames: [account.username] },
          });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Reject a pending account
       * Reject the given local account if it is currently pending approval.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#reject}
       */
      rejectAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}/reject`, {
            method: 'POST',
          });
        } else {
          const account = await category.accounts.getAccount(accountId)!;

          response = await client.request('/api/v1/pleroma/admin/users', {
            method: 'DELETE',
            body: {
              nicknames: [account.username],
            },
          });
        }

        return v.safeParse(adminAccountSchema, response.json).output || {};
      },

      /**
       * Requires features{@link Features.pleromaAdminAccounts}.
       */
      createAccount: async (params: AdminCreateAccountParams) => {
        const response = await client.request('/api/v1/pleroma/admin/users', {
          method: 'POST',
          body: { users: [params] },
        });

        return v.parse(
          v.object({
            nickname: v.string(),
            email: v.string(),
          }),
          response.json[0]?.data,
        );
      },

      /**
       * Delete an account
       * Permanently delete data for a suspended accountusers
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#delete}
       */
      deleteAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin || client.features.version.software === MITRA) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}`, {
            method: 'DELETE',
          });
        } else {
          const account = await category.accounts.getAccount(accountId)!;

          response = await client.request('/api/v1/pleroma/admin/users', {
            method: 'DELETE',
            body: {
              nicknames: [account.username],
            },
          });
        }

        return v.safeParse(adminAccountSchema, response.json).output || {};
      },

      /**
       * Perform an action against an account
       * Perform an action against an account and log this action in the moderation history. Also resolves any open reports against this account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#action}
       */
      performAccountAction: async (
        accountId: string,
        type: AdminAccountAction,
        params?: AdminPerformAccountActionParams,
      ) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}/action`, {
            body: { ...params, type },
          });
        } else {
          const account = await category.accounts.getAccount(accountId)!;

          switch (type) {
            case 'disable':
            case 'suspend':
              response = await client.request<EmptyObject>(
                '/api/v1/pleroma/admin/users/deactivate',
                {
                  body: { nicknames: [account.username] },
                },
              );
              break;
            default:
              response = { json: {} };
              break;
          }
          if (params?.report_id) await category.reports.resolveReport(params.report_id);
        }

        return response.json;
      },

      /**
       * Enable a currently disabled account
       * Re-enable a local account whose login is currently disabled.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#enable}
       */
      enableAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}/enable`, {
            method: 'POST',
          });
        } else {
          const account = await category.accounts.getAccount(accountId)!;
          response = await client.request('/api/v1/pleroma/admin/users/activate', {
            method: 'PATCH',
            body: { nicknames: [account.username] },
          });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unsilence an account
       * Unsilence an account if it is currently silenced.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsilence}
       */
      unsilenceAccount: async (accountId: string) => {
        const response = await client.request(`/api/v1/admin/accounts/${accountId}/unsilence`, {
          method: 'POST',
        });

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unsuspend an account
       * Unsuspend a currently suspended account.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsuspend}
       */
      unsuspendAccount: async (accountId: string) => {
        let response;

        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/accounts/${accountId}/unsuspend`, {
            method: 'POST',
          });
        } else {
          const { account } = await category.accounts.getAccount(accountId)!;

          response = await client.request('/api/v1/pleroma/admin/users/activate', {
            method: 'PATCH',
            body: { nicknames: [account!.acct] },
          });
          response.json = response.json?.users?.[0];
        }

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Unmark an account as sensitive
       * Stops marking an account’s posts as sensitive, if it was previously flagged as sensitive.
       * @see {@link https://docs.joinmastodon.org/methods/admin/accounts/#unsensitive}
       */
      unsensitiveAccount: async (accountId: string) => {
        const response = await client.request(`/api/v1/admin/accounts/${accountId}/unsensitive`, {
          method: 'POST',
        });

        return v.parse(adminAccountSchema, response.json);
      },

      /**
       * Requires features{@link Features.pleromaAdminAccounts}.
       */
      promoteToAdmin: async (accountId: string) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/permission_group/moderator',
          {
            method: 'DELETE',
            body: { nicknames: [account!.acct] },
          },
        );
        const response = await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/permission_group/admin',
          {
            method: 'POST',
            body: { nicknames: [account!.acct] },
          },
        );

        return response.json;
      },

      /**
       * Requires features{@link Features.pleromaAdminAccounts}.
       */
      promoteToModerator: async (accountId: string) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        await client.request<EmptyObject>('/api/v1/pleroma/admin/users/permission_group/admin', {
          method: 'DELETE',
          body: { nicknames: [account!.acct] },
        });
        const response = await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/permission_group/moderator',
          {
            method: 'POST',
            body: { nicknames: [account!.acct] },
          },
        );

        return response.json;
      },

      /**
       * Requires features{@link Features.pleromaAdminAccounts}.
       */
      demoteToUser: async (accountId: string) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/permission_group/moderator',
          {
            method: 'DELETE',
            body: { nicknames: [account!.acct] },
          },
        );
        const response = await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/permission_group/admin',
          {
            method: 'DELETE',
            body: { nicknames: [account!.acct] },
          },
        );

        return response.json;
      },

      /**
       * Tag a user.
       *
       * Requires features{@link Features.pleromaAdminAccounts}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminuserssuggest}
       */
      suggestUser: async (accountId: string) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        const response = await client.request<EmptyObject>('/api/v1/pleroma/admin/users/suggest', {
          method: 'PATCH',
          body: { nicknames: [account!.acct] },
        });

        return response.json;
      },

      /**
       * Untag a user.
       *
       * Requires features{@link Features.pleromaAdminAccounts}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminusersunsuggest}
       */
      unsuggestUser: async (accountId: string) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        const response = await client.request<EmptyObject>(
          '/api/v1/pleroma/admin/users/unsuggest',
          {
            method: 'PATCH',
            body: { nicknames: [account!.acct] },
          },
        );

        return response.json;
      },

      /**
       * Tag a user.
       *
       * Requires features{@link Features.pleromaAdminAccounts}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#put-apiv1pleromaadminuserstag}
       */
      tagUser: async (accountId: string, tags: Array<string>) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        const response = await client.request<EmptyObject>('/api/v1/pleroma/admin/users/tag', {
          method: 'PUT',
          body: { nicknames: [account!.acct], tags },
        });

        return response.json;
      },

      /**
       * Untag a user.
       *
       * Requires features{@link Features.pleromaAdminAccounts}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminuserstag}
       */
      untagUser: async (accountId: string, tags: Array<string>) => {
        const { account } = await category.accounts.getAccount(accountId)!;

        const response = await client.request<EmptyObject>('/api/v1/pleroma/admin/users/tag', {
          method: 'DELETE',
          body: { nicknames: [account!.acct], tags },
        });

        return response.json;
      },
    },

    /** Disallow certain domains to federate. */
    domainBlocks: {
      /**
       * List all blocked domains
       * Show information about all blocked domains.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#get}
       */
      getDomainBlocks: (params?: AdminGetDomainBlocksParams) =>
        client.paginatedGet('/api/v1/admin/domain_blocks', { params }, adminDomainBlockSchema),

      /**
       * Get a single blocked domain
       * Show information about a single blocked domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#get-one}
       */
      getDomainBlock: async (domainBlockId: string) => {
        const response = await client.request(`/api/v1/admin/domain_blocks/${domainBlockId}`);

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Block a domain from federating
       * Add a domain to the list of domains blocked from federating.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#create}
       */
      createDomainBlock: async (domain: string, params?: AdminCreateDomainBlockParams) => {
        const response = await client.request('/api/v1/admin/domain_blocks', {
          method: 'POST',
          body: { ...params, domain },
        });

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Update a domain block
       * Change parameters for an existing domain block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#update}
       */
      updateDomainBlock: async (domainBlockId: string, params?: AdminUpdateDomainBlockParams) => {
        const response = await client.request(`/api/v1/admin/domain_blocks/${domainBlockId}`, {
          method: 'PUT',
          body: params,
        });

        return v.parse(adminDomainBlockSchema, response.json);
      },

      /**
       * Remove a domain block
       * Lift a block against a domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_blocks/#delete}
       */
      deleteDomainBlock: async (domainBlockId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/admin/domain_blocks/${domainBlockId}`,
          {
            method: 'DELETE',
          },
        );

        return response.json;
      },
    },

    /** Perform moderation actions with reports. */
    reports: {
      /**
       * View all reports
       * View information about all reports.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#get}
       */
      getReports: (params?: AdminGetReportsParams) => {
        if (client.features.mastodonAdmin) {
          if (
            params?.resolved === undefined &&
            (client.features.version.software === GOTOSOCIAL ||
              client.features.version.software === PLEROMA)
          ) {
            if (!params) params = {};
            params.resolved = false;
          }
          return client.paginatedGet('/api/v1/admin/reports', { params }, adminReportSchema);
        }

        return paginatedPleromaReports(client, {
          state: params?.resolved === true ? 'resolved' : 'open',
          page_size: params?.limit || 100,
        });
      },

      /**
       * View a single report
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#get-one}
       */
      getReport: async (reportId: string) => {
        let response;
        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/reports/${reportId}`);
        } else {
          response = await client.request(`/api/v1/pleroma/admin/reports/${reportId}`);
        }

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Update a report
       * Change metadata for a report.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#update}
       */
      updateReport: async (reportId: string, params: AdminUpdateReportParams) => {
        const response = await client.request(`/api/v1/admin/reports/${reportId}`, {
          method: 'PUT',
          body: params,
        });

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Assign report to self
       * Claim the handling of this report to yourcategory.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#assign_tocategory}
       */
      assignReportToSelf: async (reportId: string) => {
        const response = await client.request(
          `/api/v1/admin/reports/${reportId}/assign_tocategory`,
          {
            method: 'POST',
          },
        );

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Unassign report
       * Unassign a report so that someone else can claim it.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#unassign}
       */
      unassignReport: async (reportId: string) => {
        const response = await client.request(`/api/v1/admin/reports/${reportId}/unassign`, {
          method: 'POST',
        });

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Mark report as resolved
       *
       * Mark a report as resolved with no further action taken.
       *
       * `action_taken_comment` param requires features{@link Features.mastodonAdminResolveReportWithComment}.
       * @param action_taken_comment Optional admin comment on the action taken in response to this report. Supported by GoToSocial only.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#resolve}
       */
      resolveReport: async (reportId: string, action_taken_comment?: string) => {
        let response;
        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/reports/${reportId}/resolve`, {
            method: 'POST',
            body: { action_taken_comment },
          });
        } else {
          response = await client.request(`/api/v1/pleroma/admin/reports/${reportId}`, {
            method: 'PATCH',
            body: { reports: [{ id: reportId, state: 'resolved' }] },
          });
        }

        return v.parse(adminReportSchema, response.json);
      },

      /**
       * Reopen a closed report
       * Reopen a currently closed report, if it is closed.
       * @see {@link https://docs.joinmastodon.org/methods/admin/reports/#reopen}
       */
      reopenReport: async (reportId: string) => {
        let response;
        if (client.features.mastodonAdmin) {
          response = await client.request(`/api/v1/admin/reports/${reportId}/reopen`, {
            method: 'POST',
          });
        } else {
          response = await client.request(`/api/v1/pleroma/admin/reports/${reportId}`, {
            method: 'PATCH',
            body: { reports: [{ id: reportId, state: 'open' }] },
          });
        }

        return v.parse(adminReportSchema, response.json);
      },
    },

    statuses: {
      /**
       * @param params Retrieves all latest statuses
       *
       * The params are subject to change in case Mastodon implements alike route.
       *
       * Requires features{@link Features.pleromaAdminStatuses}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminstatuses}
       */
      getStatuses: (params?: AdminGetStatusesParams) =>
        paginatedPleromaStatuses(client, {
          page_size: params?.limit || 100,
          page: 1,
          local_only: params?.local_only,
          with_reblogs: params?.with_reblogs,
          godmode: params?.with_private,
        }),

      /**
       * Show status by id
       *
       * Requires features{@link Features.pleromaAdminStatuses}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminstatusesid}
       */
      getStatus: async (statusId: string) => {
        const response = await client.request(`/api/v1/pleroma/admin/statuses/${statusId}`);

        return v.parse(statusSchema, response.json);
      },

      /**
       * Change the scope of an individual reported status
       *
       * Requires features{@link Features.pleromaAdminStatuses}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#put-apiv1pleromaadminstatusesid}
       */
      updateStatus: async (statusId: string, params: AdminUpdateStatusParams) => {
        const response = await client.request(`/api/v1/pleroma/admin/statuses/${statusId}`, {
          method: 'PUT',
          body: params,
        });

        return v.parse(statusSchema, response.json);
      },

      /**
       * Delete an individual reported status
       *
       * Requires features{@link Features.adminDeleteStatus}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminstatusesid}
       */
      deleteStatus: async (statusId: string) => {
        const response = await client.request<EmptyObject>(
          client.features.version.software === MITRA
            ? `/api/v1/admin/posts/${statusId}`
            : `/api/v1/pleroma/admin/statuses/${statusId}`,
          {
            method: 'DELETE',
          },
        );

        return response.json;
      },

      /**
       * Requires features{@link Features.pleromaAdminStatusesRedact}
       */
      redactStatus: async (
        statusId: string,
        params: EditStatusParams & { overwrite?: boolean },
      ) => {
        const response = await client.request(`/api/v1/pleroma/admin/statuses/${statusId}/redact`, {
          method: 'PATCH',
          body: params,
        });

        return v.parse(statusSchema, response.json);
      },

      /**
       * Requires features{@link Features.pleromaAdminStatusesRedact}
       */
      getStatusSource: async (statusId: string) => {
        const response = await client.request(`/api/v1/pleroma/admin/statuses/${statusId}/source`);

        return v.parse(statusSourceSchema, response.json);
      },
    },

    trends: {
      /**
       * View trending links
       * Links that have been shared more than others, including unapproved and unreviewed links.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#links}
       */
      getTrendingLinks: async () => {
        const response = await client.request('/api/v1/admin/trends/links');

        return v.parse(filteredArray(trendsLinkSchema), response.json);
      },

      /**
       * View trending statuses
       * Statuses that have been interacted with more than others, including unapproved and unreviewed statuses.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#statuses}
       */
      getTrendingStatuses: async () => {
        const response = await client.request('/api/v1/admin/trends/statuses');

        return v.parse(filteredArray(statusSchema), response.json);
      },

      /**
       * View trending tags
       * Tags that are being used more frequently within the past week, including unapproved and unreviewed tags.
       * @see {@link https://docs.joinmastodon.org/methods/admin/trends/#tags}
       */
      getTrendingTags: async () => {
        const response = await client.request('/api/v1/admin/trends/links');

        return v.parse(filteredArray(adminTagSchema), response.json);
      },
    },

    /** Block certain email addresses by their hash. */
    canonicalEmailBlocks: {
      /**
       * List all canonical email blocks
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#get}
       */
      getCanonicalEmailBlocks: (params?: AdminGetCanonicalEmailBlocks) =>
        client.paginatedGet(
          '/api/v1/admin/canonical_email_blocks',
          { params },
          adminCanonicalEmailBlockSchema,
        ),

      /**
       * Show a single canonical email block
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#get-one}
       */
      getCanonicalEmailBlock: async (canonicalEmailBlockId: string) => {
        const response = await client.request(
          `/api/v1/admin/canonical_email_blocks/${canonicalEmailBlockId}`,
        );

        return v.parse(adminCanonicalEmailBlockSchema, response.json);
      },

      /**
       * Test
       * Canoniocalize and hash an email address.
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#test}
       */
      testCanonicalEmailBlock: async (email: string) => {
        const response = await client.request('/api/v1/admin/canonical_email_blocks/test', {
          method: 'POST',
          body: { email },
        });

        return v.parse(filteredArray(adminCanonicalEmailBlockSchema), response.json);
      },

      /**
       * Block a canonical email
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#create}
       */
      createCanonicalEmailBlock: async (email: string, canonical_email_hash?: string) => {
        const response = await client.request('/api/v1/admin/canonical_email_blocks', {
          method: 'POST',
          body: { email, canonical_email_hash },
        });

        return v.parse(filteredArray(adminCanonicalEmailBlockSchema), response.json);
      },

      /**
       * Delete a canonical email block
       * @see {@link https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#delete}
       */
      deleteCanonicalEmailBlock: async (canonicalEmailBlockId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/admin/canonical_email_blocks/${canonicalEmailBlockId}`,
          { method: 'DELETE' },
        );

        return response.json;
      },
    },

    /** Obtain qualitative metrics about the server. */
    dimensions: {
      /**
       * Get dimensional data
       * Obtain information about popularity of certain accounts, servers, languages, etc.
       * @see {@link https://docs.joinmastodon.org/methods/admin/dimensions/#get}
       */
      getDimensions: async (keys: AdminDimensionKey[], params?: AdminGetDimensionsParams) => {
        const response = await client.request('/api/v1/admin/dimensions', {
          method: 'POST',
          params: { ...params, keys },
        });

        return v.parse(filteredArray(adminDimensionSchema), response.json);
      },
    },

    /** Allow certain domains to federate. */
    domainAllows: {
      /**
       * List all allowed domains
       * Show information about all allowed domains.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#get}
       */
      getDomainAllows: (params?: AdminGetDomainAllowsParams) =>
        client.paginatedGet('/api/v1/admin/domain_allows', { params }, adminDomainAllowSchema),

      /**
       * Get a single allowed domain
       * Show information about a single allowed domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#get-one}
       */
      getDomainAllow: async (domainAllowId: string) => {
        const response = await client.request(`/api/v1/admin/domain_allows/${domainAllowId}`);

        return v.parse(adminDomainAllowSchema, response.json);
      },

      /**
       * Allow a domain to federate
       * Add a domain to the list of domains allowed to federate, to be used when the instance is in allow-list federation mode.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#create}
       */
      createDomainAllow: async (domain: string) => {
        const response = await client.request('/api/v1/admin/domain_allows', {
          method: 'POST',
          body: { domain },
        });

        return v.parse(adminDomainAllowSchema, response.json);
      },

      /**
       * Delete an allowed domain
       * Delete a domain from the allowed domains list.
       * @see {@link https://docs.joinmastodon.org/methods/admin/domain_allows/#delete}
       */
      deleteDomainAllow: async (domainAllowId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/admin/domain_allows/${domainAllowId}`,
          {
            method: 'DELETE',
          },
        );

        return response.json;
      },
    },

    /** Disallow certain email domains from signing up. */
    emailDomainBlocks: {
      /**
       * List all blocked email domains
       * Show information about all email domains blocked from signing up.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#get}
       */
      getEmailDomainBlocks: (params?: AdminGetEmailDomainBlocksParams) =>
        client.paginatedGet(
          '/api/v1/admin/email_domain_blocks',
          { params },
          adminEmailDomainBlockSchema,
        ),

      /**
       * Get a single blocked email domain
       * Show information about a single email domain that is blocked from signups.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#get-one}
       */
      getEmailDomainBlock: async (emailDomainBlockId: string) => {
        const response = await client.request(
          `/api/v1/admin/email_domain_blocks/${emailDomainBlockId}`,
        );

        return v.parse(adminEmailDomainBlockSchema, response.json);
      },

      /**
       * Block an email domain from signups
       * Add a domain to the list of email domains blocked from signups.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#create}
       */
      createEmailDomainBlock: async (domain: string) => {
        const response = await client.request('/api/v1/admin/email_domain_blocks', {
          method: 'POST',
          body: { domain },
        });

        return v.parse(adminEmailDomainBlockSchema, response.json);
      },

      /**
       * Delete an email domain block
       * Lift a block against an email domain.
       * @see {@link https://docs.joinmastodon.org/methods/admin/email_domain_blocks/#delete}
       */
      deleteEmailDomainBlock: async (emailDomainBlockId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/admin/email_domain_blocks/${emailDomainBlockId}`,
          { method: 'DELETE' },
        );

        return response.json;
      },
    },

    /** Disallow certain IP address ranges from signing up. */
    ipBlocks: {
      /**
       * List all IP blocks
       * Show information about all blocked IP ranges.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#get}
       */
      getIpBlocks: (params?: AdminGetIpBlocksParams) =>
        client.paginatedGet('/api/v1/admin/ip_blocks', { params }, adminIpBlockSchema),

      /**
       * Get a single IP block
       * Show information about a single IP block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#get-one}
       */
      getIpBlock: async (ipBlockId: string) => {
        const response = await client.request(`/api/v1/admin/ip_blocks/${ipBlockId}`);

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Block an IP address range from signing up
       * Add an IP address range to the list of IP blocks.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#create}
       */
      createIpBlock: async (params: AdminCreateIpBlockParams) => {
        const response = await client.request('/api/v1/admin/ip_blocks', {
          method: 'POST',
          body: params,
        });

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Update a domain block
       * Change parameters for an existing IP block.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#update}
       */
      updateIpBlock: async (ipBlockId: string, params: AdminCreateIpBlockParams) => {
        const response = await client.request(`/api/v1/admin/ip_blocks/${ipBlockId}`, {
          method: 'POST',
          body: params,
        });

        return v.parse(adminIpBlockSchema, response.json);
      },

      /**
       * Delete an IP block
       * Lift a block against an IP range.
       * @see {@link https://docs.joinmastodon.org/methods/admin/ip_blocks/#delete}
       */
      deleteIpBlock: async (ipBlockId: string) => {
        const response = await client.request<EmptyObject>(`/api/v1/admin/ip_blocks/${ipBlockId}`, {
          method: 'DELETE',
        });

        return response.json;
      },
    },

    /** Obtain quantitative metrics about the server. */
    measures: {
      /**
       * Get measurable data
       * Obtain quantitative metrics about the server.
       * @see {@link https://docs.joinmastodon.org/methods/admin/measures/#get}
       */
      getMeasures: async (
        keys: AdminMeasureKey[],
        start_at: string,
        end_at: string,
        params?: AdminGetMeasuresParams,
      ) => {
        const response = await client.request('/api/v1/admin/measures', {
          method: 'POST',
          params: { ...params, keys, start_at, end_at },
        });

        return v.parse(filteredArray(adminMeasureSchema), response.json);
      },
    },

    /** Show retention data over time. */
    retention: {
      /**
       * Calculate retention data
       *
       * Generate a retention data report for a given time period and bucket.
       * @see {@link https://docs.joinmastodon.org/methods/admin/retention/#create}
       */
      getRetention: async (start_at: string, end_at: string, frequency: 'day' | 'month') => {
        const response = await client.request('/api/v1/admin/retention', {
          method: 'POST',
          params: { start_at, end_at, frequency },
        });

        return v.parse(filteredArray(adminCohortSchema), response.json);
      },
    },

    announcements: {
      /**
       * List announcements
       *
       * Requires features{@link Features.pleromaAdminAnnouncements}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements}
       */
      getAnnouncements: async (
        params?: AdminGetAnnouncementsParams,
      ): Promise<PaginatedResponse<AdminAnnouncement>> => {
        const response = await client.request('/api/v1/pleroma/admin/announcements', { params });

        const items = v.parse(filteredArray(adminAnnouncementSchema), response.json);

        return new PaginatedResponse(items, {
          next: items.length
            ? () =>
                category.announcements.getAnnouncements({
                  ...params,
                  offset: (params?.offset || 0) + items.length,
                })
            : null,
          partial: false,
        });
      },

      /**
       * Display one announcement
       *
       * Requires features{@link Features.pleromaAdminAnnouncements}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncementsid}
       */
      getAnnouncement: async (announcementId: string) => {
        const response = await client.request(
          `/api/v1/pleroma/admin/announcements/${announcementId}`,
        );

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Create an announcement
       *
       * Requires features{@link Features.pleromaAdminAnnouncements}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminannouncements}
       */
      createAnnouncement: async (params: AdminCreateAnnouncementParams) => {
        const response = await client.request('/api/v1/pleroma/admin/announcements', {
          method: 'POST',
          body: params,
        });

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Change an announcement
       *
       * Requires features{@link Features.pleromaAdminAnnouncements}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminannouncementsid}
       */
      updateAnnouncement: async (announcementId: string, params: AdminUpdateAnnouncementParams) => {
        const response = await client.request(
          `/api/v1/pleroma/admin/announcements/${announcementId}`,
          { method: 'PATCH', body: params },
        );

        return v.parse(adminAnnouncementSchema, response.json);
      },

      /**
       * Delete an announcement
       *
       * Requires features{@link Features.pleromaAdminAnnouncements}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminannouncementsid}
       */
      deleteAnnouncement: async (announcementId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/pleroma/admin/announcements/${announcementId}`,
          { method: 'DELETE' },
        );

        return response.json;
      },
    },

    domains: {
      /**
       * List of domains
       *
       * Requires features{@link Features.domains}.
       */
      getDomains: async () => {
        const response = await client.request('/api/v1/pleroma/admin/domains');

        return v.parse(filteredArray(adminDomainSchema), response.json);
      },

      /**
       * Create a domain
       *
       * Requires features{@link Features.domains}.
       */
      createDomain: async (params: AdminCreateDomainParams) => {
        const response = await client.request('/api/v1/pleroma/admin/domains', {
          method: 'POST',
          body: params,
        });

        return v.parse(adminDomainSchema, response.json);
      },

      /**
       * Change domain publicity
       *
       * Requires features{@link Features.domains}.
       */
      updateDomain: async (domainId: string, isPublic: boolean) => {
        const response = await client.request(`/api/v1/pleroma/admin/domains/${domainId}`, {
          method: 'PATCH',
          body: { public: isPublic },
        });

        return v.parse(adminDomainSchema, response.json);
      },

      /**
       * Delete a domain
       *
       * Requires features{@link Features.domains}.
       */
      deleteDomain: async (domainId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/pleroma/admin/domains/${domainId}`,
          {
            method: 'DELETE',
          },
        );

        return response.json;
      },
    },

    moderationLog: {
      /**
       * Get moderation log
       *
       * Requires features{@link Features.pleromaAdminModerationLog}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminmoderation_log}
       */
      getModerationLog: async ({ limit, ...params }: AdminGetModerationLogParams = {}): Promise<
        PaginatedResponse<AdminModerationLogEntry>
      > => {
        const response = await client.request('/api/v1/pleroma/admin/moderation_log', {
          params: { page_size: limit, ...params },
        });

        const items = v.parse(filteredArray(adminModerationLogEntrySchema), response.json.items);

        return new PaginatedResponse(items, {
          previous:
            params.page && params.page > 1
              ? () => category.moderationLog.getModerationLog({ ...params, page: params.page! - 1 })
              : null,
          next:
            response.json.total > (params.page || 1) * (limit || 50)
              ? () =>
                  category.moderationLog.getModerationLog({
                    ...params,
                    page: (params.page || 1) + 1,
                  })
              : null,
          partial: response.status === 206,
        });
      },
    },

    relays: {
      /**
       * List Relays
       *
       * Requires features{@link Features.pleromaAdminRelays}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrelay}
       */
      getRelays: async () => {
        const response = await client.request('/api/v1/pleroma/admin/relay');

        return v.parse(filteredArray(adminRelaySchema), response.json);
      },

      /**
       * Follow a Relay
       *
       * Requires features{@link Features.pleromaAdminRelays}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminrelay}
       */
      followRelay: async (relayUrl: string) => {
        const response = await client.request('/api/v1/pleroma/admin/relay', {
          method: 'POST',
          body: { relay_url: relayUrl },
        });

        return v.parse(adminRelaySchema, response.json);
      },

      /**
       * Unfollow a Relay
       *
       * Requires features{@link Features.pleromaAdminRelays}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminrelay}
       */
      unfollowRelay: async (relayUrl: string, force = false) => {
        const response = await client.request('/api/v1/pleroma/admin/relay', {
          method: 'DELETE',
          body: { relay_url: relayUrl, force },
        });

        return v.parse(adminRelaySchema, response.json);
      },
    },

    rules: {
      /**
       * List rules
       *
       * Requires features{@link Features.adminRules}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrules}
       */
      getRules: async () => {
        const response = await client.request(
          client.features.version.software === GOTOSOCIAL
            ? '/api/v1/admin/instance/rules'
            : '/api/v1/pleroma/admin/rules',
        );

        return v.parse(filteredArray(adminRuleSchema), response.json);
      },

      /**
       * Create a rule
       *
       * Requires features{@link Features.adminRules}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#post-apiv1pleromaadminrules}
       */
      createRule: async (params: AdminCreateRuleParams) => {
        const response = await client.request(
          client.features.version.software === GOTOSOCIAL
            ? '/api/v1/admin/instance/rules'
            : '/api/v1/pleroma/admin/rules',
          { method: 'POST', body: params },
        );

        return v.parse(adminRuleSchema, response.json);
      },

      /**
       * Update a rule
       *
       * Requires features{@link Features.adminRules}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#patch-apiv1pleromaadminrulesid}
       */
      updateRule: async (ruleId: string, params: AdminUpdateRuleParams) => {
        const response = await client.request(
          `/api/v1/${client.features.version.software === GOTOSOCIAL ? 'admin/instance' : 'pleroma/admin'}/rules/${ruleId}`,
          { method: 'PATCH', body: params },
        );

        return v.parse(adminRuleSchema, response.json);
      },

      /**
       * Delete a rule
       *
       * Requires features{@link Features.adminRules}.
       * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#delete-apiv1pleromaadminrulesid}
       */
      deleteRule: async (ruleId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/${client.features.version.software === GOTOSOCIAL ? 'admin/instance' : 'pleroma/admin'}/rules/${ruleId}`,
          { method: 'DELETE' },
        );

        return response.json;
      },
    },

    config: {
      getPleromaConfig: async () => {
        const response = await client.request('/api/v1/pleroma/admin/config');

        return v.parse(pleromaConfigSchema, response.json);
      },

      updatePleromaConfig: async (params: PleromaConfig['configs']) => {
        const response = await client.request('/api/v1/pleroma/admin/config', {
          method: 'POST',
          body: { configs: params },
        });

        return v.parse(pleromaConfigSchema, response.json);
      },
    },

    customEmojis: {
      /**
       * View local and remote emojis available to/known by this instance.
       *
       * Requires features{@link Features.adminCustomEmojis}.
       * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
       */
      getCustomEmojis: (params: AdminGetCustomEmojisParams) =>
        client.paginatedGet('/api/v1/admin/custom_emojis', { params }, adminCustomEmojiSchema),

      /**
       * Get the admin view of a single emoji.
       *
       * Requires features{@link Features.adminCustomEmojis}.
       * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
       */
      getCustomEmoji: async (emojiId: string) => {
        const response = await client.request(`/api/v1/admin/custom_emojis/${emojiId}`);

        return v.parse(adminCustomEmojiSchema, response.json);
      },

      /**
       * Get the admin view of a single emoji.
       *
       * Requires features{@link Features.adminCustomEmojis}.
       * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
       */
      createCustomEmoji: async (params: AdminCreateCustomEmojiParams) => {
        const response = await client.request('/api/v1/admin/custom_emojis', {
          method: 'POST',
          body: params,
          contentType: '',
        });

        return v.parse(adminCustomEmojiSchema, response.json);
      },

      updateCustomEmoji: async (emojiId: string, params: AdminUpdateCustomEmojiParams) => {
        const response = await client.request(`/api/v1/admin/custom_emojis/${emojiId}`, {
          method: 'PATCH',
          body: params,
          contentType: '',
        });

        return v.parse(adminCustomEmojiSchema, response.json);
      },

      /**
       * Delete a **local** emoji with the given ID from the instance.
       *
       * Requires features{@link Features.adminCustomEmojis}.
       * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
       */
      deleteCustomEmoji: async (emojiId: string) => {
        const response = await client.request(`/api/v1/admin/custom_emojis/${emojiId}`, {
          method: 'DELETE',
        });

        return v.parse(adminCustomEmojiSchema, response.json);
      },
    },
  };
  return category;
};

export { admin };
