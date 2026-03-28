import * as v from 'valibot';

import {
  accountSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  statusSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';
import { PIXELFED } from '@/features';

import type { PlApiBaseClient } from '@/client-base';
import type { GroupRole } from '@/entities';
import type { AdminGetGroupsParams } from '@/params/admin';
import type {
  CreateGroupParams,
  GetGroupBlocksParams,
  GetGroupMembershipRequestsParams,
  GetGroupMembershipsParams,
  UpdateGroupParams,
} from '@/params/groups';
import type { EmptyObject } from '@/utils/types';

/** Routes that are not part of any stable release */
const experimental = (client: PlApiBaseClient) => {
  const category = {
    admin: {
      /** @see {@link https://github.com/mastodon/mastodon/pull/19059} */
      groups: {
        /** list groups known to the instance. Mimics the interface of `/api/v1/admin/accounts` */
        getGroups: async (params?: AdminGetGroupsParams) => {
          const response = await client.request('/api/v1/admin/groups', { params });

          return v.parse(filteredArray(groupSchema), response.json);
        },

        /** return basic group information */
        getGroup: async (groupId: string) => {
          const response = await client.request(`/api/v1/admin/groups/${groupId}`);

          return v.parse(groupSchema, response.json);
        },

        /** suspends a group */
        suspendGroup: async (groupId: string) => {
          const response = await client.request(`/api/v1/admin/groups/${groupId}/suspend`, {
            method: 'POST',
          });

          return v.parse(groupSchema, response.json);
        },

        /** lift a suspension */
        unsuspendGroup: async (groupId: string) => {
          const response = await client.request(`/api/v1/admin/groups/${groupId}/unsuspend`, {
            method: 'POST',
          });

          return v.parse(groupSchema, response.json);
        },

        /** deletes an already-suspended group */
        deleteGroup: async (groupId: string) => {
          const response = await client.request(`/api/v1/admin/groups/${groupId}`, {
            method: 'DELETE',
          });

          return v.parse(groupSchema, response.json);
        },
      },
    },

    /** @see {@link https://github.com/mastodon/mastodon/pull/19059} */
    groups: {
      /** returns an array of `Group` entities the current user is a member of */
      getGroups: async () => {
        let response;
        if (client.features.version.software === PIXELFED) {
          response = await client.request('/api/v0/groups/self/list');
        } else {
          response = await client.request('/api/v1/groups');
        }

        return v.parse(filteredArray(groupSchema), response.json);
      },

      /** create a group with the given attributes (`display_name`, `note`, `avatar` and `header`). Sets the user who made the request as group administrator */
      createGroup: async (params: CreateGroupParams) => {
        let response;

        if (client.features.version.software === PIXELFED) {
          response = await client.request('/api/v0/groups/create', {
            method: 'POST',
            body: {
              ...params,
              name: params.display_name,
              description: params.note,
              membership: 'public',
            },
            formData: !!(params.avatar || params.header),
          });

          if (response.json?.id) {
            return category.groups.getGroup(response.json.id);
          }
        } else {
          response = await client.request('/api/v1/groups', {
            method: 'POST',
            body: params,
            formData: !!(params.avatar || params.header),
          });
        }

        return v.parse(groupSchema, response.json);
      },

      /** returns the `Group` entity describing a given group */
      getGroup: async (groupId: string) => {
        let response;

        if (client.features.version.software === PIXELFED) {
          response = await client.request(`/api/v0/groups/${groupId}`);
        } else {
          response = await client.request(`/api/v1/groups/${groupId}`);
        }

        return v.parse(groupSchema, response.json);
      },

      /** update group attributes (`display_name`, `note`, `avatar` and `header`) */
      updateGroup: async (groupId: string, params: UpdateGroupParams) => {
        const response = await client.request(`/api/v1/groups/${groupId}`, {
          method: 'PUT',
          body: params,
          formData: !!(params.avatar || params.header),
        });

        return v.parse(groupSchema, response.json);
      },

      /** irreversibly deletes the group */
      deleteGroup: async (groupId: string) => {
        let response;

        if (client.features.version.software === PIXELFED) {
          response = await client.request<EmptyObject>('/api/v0/groups/delete', {
            method: 'POST',
            params: { gid: groupId },
          });
        } else {
          response = await client.request<EmptyObject>(`/api/v1/groups/${groupId}`, {
            method: 'DELETE',
          });
        }

        return response.json;
      },

      /** Has an optional role attribute that can be used to filter by role (valid roles are `"admin"`, `"moderator"`, `"user"`). */
      getGroupMemberships: (
        groupId: string,
        role?: GroupRole,
        params?: GetGroupMembershipsParams,
      ) =>
        client.paginatedGet(
          client.features.version.software === PIXELFED
            ? `/api/v0/groups/members/list?gid=${groupId}`
            : `/api/v1/groups/${groupId}/memberships`,
          { params: { ...params, role } },
          groupMemberSchema,
        ),

      /** returns an array of `Account` entities representing pending requests to join a group */
      getGroupMembershipRequests: (groupId: string, params?: GetGroupMembershipRequestsParams) =>
        client.paginatedGet(
          client.features.version.software === PIXELFED
            ? `/api/v0/groups/members/requests?gid=${groupId}`
            : `/api/v1/groups/${groupId}/membership_requests`,
          { params },
          accountSchema,
        ),

      /** accept a pending request to become a group member */
      acceptGroupMembershipRequest: async (groupId: string, accountId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`,
          { method: 'POST' },
        );

        return response.json;
      },

      /** reject a pending request to become a group member */
      rejectGroupMembershipRequest: async (groupId: string, accountId: string) => {
        const response = await client.request<EmptyObject>(
          `/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`,
          { method: 'POST' },
        );

        return response.json;
      },

      /** delete a group post (actually marks it as `revoked` if it is a local post) */
      deleteGroupStatus: async (groupId: string, statusId: string) => {
        const response = await client.request(`/api/v1/groups/${groupId}/statuses/${statusId}`, {
          method: 'DELETE',
        });

        return v.parse(statusSchema, response.json);
      },

      /** list accounts blocked from interacting with the group */
      getGroupBlocks: (groupId: string, params?: GetGroupBlocksParams) =>
        client.paginatedGet(`/api/v1/groups/${groupId}/blocks`, { params }, accountSchema),

      /** block one or more users. If they were in the group, they are also kicked of it */
      blockGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await client.request<EmptyObject>(`/api/v1/groups/${groupId}/blocks`, {
          method: 'POST',
          params: { account_ids: accountIds },
        });

        return response.json;
      },

      /** block one or more users. If they were in the group, they are also kicked of it */
      unblockGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await client.request<EmptyObject>(`/api/v1/groups/${groupId}/blocks`, {
          method: 'DELETE',
          params: { account_ids: accountIds },
        });

        return response.json;
      },

      /** joins (or request to join) a given group */
      joinGroup: async (groupId: string) => {
        const response = await client.request(`/api/v1/groups/${groupId}/join`, { method: 'POST' });

        return v.parse(groupRelationshipSchema, response.json);
      },

      /** leaves a given group */
      leaveGroup: async (groupId: string) => {
        const response = await client.request(`/api/v1/groups/${groupId}/leave`, {
          method: 'POST',
        });

        return v.parse(groupRelationshipSchema, response.json);
      },

      /** kick one or more group members */
      kickGroupUsers: async (groupId: string, accountIds: string[]) => {
        const response = await client.request<EmptyObject>(`/api/v1/groups/${groupId}/kick`, {
          method: 'POST',
          params: { account_ids: accountIds },
        });

        return response.json;
      },

      /** promote one or more accounts to role `new_role`. An error is returned if any of those accounts has a higher role than `new_role` already, or if the role is higher than the issuing user's. Valid roles are `admin`, and `moderator` and `user`. */
      promoteGroupUsers: async (groupId: string, accountIds: string[], role: GroupRole) => {
        const response = await client.request(`/api/v1/groups/${groupId}/promote`, {
          method: 'POST',
          params: { account_ids: accountIds, role },
        });

        return v.parse(filteredArray(groupMemberSchema), response.json);
      },

      /** demote one or more accounts to role `new_role`. Returns an error unless every of the target account has a strictly lower role than the user (you cannot demote someone with the same role as you), or if any target account already has a role lower than `new_role`. Valid roles are `admin`, `moderator` and `user`. */
      demoteGroupUsers: async (groupId: string, accountIds: string[], role: GroupRole) => {
        const response = await client.request(`/api/v1/groups/${groupId}/demote`, {
          method: 'POST',
          params: { account_ids: accountIds, role },
        });

        return v.parse(filteredArray(groupMemberSchema), response.json);
      },

      getGroupRelationships: async (groupIds: string[]) => {
        const response = await client.request('/api/v1/groups/relationships', {
          params: { id: groupIds },
        });

        return v.parse(filteredArray(groupRelationshipSchema), response.json);
      },
    },
  };
  return category;
};

export { experimental };
