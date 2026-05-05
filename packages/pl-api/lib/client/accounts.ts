import * as v from 'valibot';

import {
  accountSchema,
  antennaSchema,
  circleSchema,
  familiarFollowersSchema,
  featuredTagSchema,
  listSchema,
  relationshipSchema,
  reportSchema,
  scrobbleSchema,
  statusSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';
import { ICESHRIMP_NET, PIXELFED, PLEROMA } from '@/features';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreateScrobbleParams,
  FollowAccountParams,
  GetAccountEndorsementsParams,
  GetAccountFavouritesParams,
  GetAccountFollowersParams,
  GetAccountFollowingParams,
  GetAccountParams,
  GetAccountStatusesParams,
  GetAccountSubscribersParams,
  GetRelationshipsParams,
  GetScrobblesParams,
  ReportAccountParams,
  SearchAccountParams,
} from '@/params/accounts';
import type { RequestMeta } from '@/request';
import type { EmptyObject } from '@/utils/types';

const accounts = (client: PlApiBaseClient) => ({
  /**
   * Get account
   * View information about a profile.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#get}
   */
  getAccount: async (accountId: string, params?: GetAccountParams) => {
    const response = await client.request(`/api/v1/accounts/${accountId}`, { params });

    return v.parse(accountSchema, response.json);
  },

  /**
   * Get multiple accounts
   * View information about multiple profiles.
   *
   * Requires features{@link Features.getAccounts}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#index}
   */
  getAccounts: async (accountId: string[]) => {
    const response = await client.request('/api/v1/accounts', { params: { id: accountId } });

    return v.parse(filteredArray(accountSchema), response.json);
  },

  /**
   * Get account’s statuses
   * Statuses posted to the given account.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#statuses}
   */
  getAccountStatuses: (accountId: string, params?: GetAccountStatusesParams) =>
    client.paginatedGet(`/api/v1/accounts/${accountId}/statuses`, { params }, statusSchema),

  /**
   * Get account’s followers
   * Accounts which follow the given account, if network is not hidden by the account owner.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#followers}
   */
  getAccountFollowers: (accountId: string, params?: GetAccountFollowersParams) =>
    client.paginatedGet(`/api/v1/accounts/${accountId}/followers`, { params }, accountSchema),

  /**
   * Get account’s following
   * Accounts which the given account is following, if network is not hidden by the account owner.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#following}
   */
  getAccountFollowing: (accountId: string, params?: GetAccountFollowingParams) =>
    client.paginatedGet(`/api/v1/accounts/${accountId}/following`, { params }, accountSchema),

  /**
   * Subscriptions to the given user.
   *
   * Requires features{@link Features.subscriptions}.
   */
  getAccountSubscribers: (accountId: string, params?: GetAccountSubscribersParams) =>
    client.paginatedGet(`/api/v1/accounts/${accountId}/subscribers`, { params }, accountSchema),

  /**
   * Get account’s featured tags
   * Tags featured by this account.
   *
   * Requires features{@link Features.featuredTags}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#featured_tags}
   */
  getAccountFeaturedTags: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/featured_tags`);

    return v.parse(filteredArray(featuredTagSchema), response.json);
  },

  /**
   * Get lists containing this account
   * User lists that you have added this account to.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#lists}
   */
  getAccountLists: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/lists`);

    return v.parse(filteredArray(listSchema), response.json);
  },

  /**
   * Get antennas containing this account
   * User antennas that you have added this account to.
   * Requires features{@link Features.antennas}.
   */
  getAccountAntennas: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/antennas`);

    return v.parse(filteredArray(antennaSchema), response.json);
  },

  /**
   * Get antennas excluding this account
   * Requires features{@link Features.antennas}.
   */
  getAccountExcludeAntennas: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/exclude_antennas`);

    return v.parse(filteredArray(circleSchema), response.json);
  },

  /**
   * Get circles including this account
   * User circles that you have added this account to.
   * Requires features{@link Features.circles}.
   */
  getAccountCircles: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/circles`);

    return v.parse(filteredArray(antennaSchema), response.json);
  },

  /**
   * Follow account
   * Follow the given account. Can also be used to update whether to show reblogs or enable notifications.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#follow}
   */
  followAccount: async (accountId: string, params?: FollowAccountParams) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/follow`, {
      method: 'POST',
      body: params,
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Unfollow account
   * Unfollow the given account.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#unfollow}
   */
  unfollowAccount: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/unfollow`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Remove account from followers
   * Remove the given account from your followers.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#remove_from_followers}
   */
  removeAccountFromFollowers: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/remove_from_followers`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Feature account on your profile
   * Add the given account to the user’s featured profiles.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#pin}
   */
  pinAccount: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/pin`, { method: 'POST' });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Unfeature account from profile
   * Remove the given account from the user’s featured profiles.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#unpin}
   */
  unpinAccount: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/unpin`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Set private note on profile
   * Sets a private note on a user.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#note}
   */
  updateAccountNote: async (accountId: string, comment: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/note`, {
      method: 'POST',
      body: { comment },
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Check relationships to other accounts
   * Find out whether a given account is followed, blocked, muted, etc.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#relationships}
   */
  getRelationships: async (accountIds: string[], params?: GetRelationshipsParams) => {
    const response = await client.request('/api/v1/accounts/relationships', {
      params: { ...params, id: accountIds },
    });

    return v.parse(filteredArray(relationshipSchema), response.json);
  },

  /**
   * Find familiar followers
   * Obtain a list of all accounts that follow a given account, filtered for accounts you follow.
   *
   * Requires features{@link Features.familiarFollowers}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#familiar_followers}
   */
  getFamiliarFollowers: async (accountIds: string[]) => {
    let response: any;

    if (client.features.version.software === PIXELFED) {
      const settledResponse = await Promise.allSettled(
        accountIds.map(async (accountId) => {
          const accounts = (await client.request(`/api/v1.1/accounts/mutuals/${accountId}`)).json;

          return {
            id: accountId,
            accounts,
          };
        }),
      );

      response = settledResponse.map((result, index) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              id: accountIds[index],
              accounts: [],
            },
      );
    } else {
      response = (
        await client.request('/api/v1/accounts/familiar_followers', { params: { id: accountIds } })
      ).json;
    }

    return v.parse(filteredArray(familiarFollowersSchema), response);
  },

  /**
   * Search for matching accounts
   * Search for matching accounts by username or display name.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#search}
   */
  searchAccounts: async (q: string, params?: SearchAccountParams, meta?: RequestMeta) => {
    const response = await client.request('/api/v1/accounts/search', {
      ...meta,
      params: { ...params, q },
    });

    return v.parse(filteredArray(accountSchema), response.json);
  },

  /**
   * Lookup account ID from Webfinger address
   * Quickly lookup a username to see if it is available, skipping WebFinger resolution.

   * Requires features{@link Features.accountLookup}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#lookup}
   */
  lookupAccount: async (acct: string, meta?: RequestMeta) => {
    const response = await client.request('/api/v1/accounts/lookup', { ...meta, params: { acct } });

    return v.parse(accountSchema, response.json);
  },

  /**
   * File a report
   * @see {@link https://docs.joinmastodon.org/methods/reports/#post}
   */
  reportAccount: async (accountId: string, params: ReportAccountParams) => {
    const response = await client.request('/api/v1/reports', {
      method: 'POST',
      body: { ...params, account_id: accountId },
    });

    return v.parse(reportSchema, response.json);
  },

  /**
   * Endorsements
   * Returns endorsed accounts
   *
   * Requires features{@link Features.accountEndorsements}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaaccountsidendorsements}
   * @see {@link https://docs.joinmastodon.org/methods/accounts/endorsements}
   */
  getAccountEndorsements: (accountId: string, params?: GetAccountEndorsementsParams) =>
    client.paginatedGet(
      `/api/v1/${client.features.version.software === PLEROMA ? 'pleroma/' : ''}accounts/${accountId}/endorsements`,
      { params },
      accountSchema,
    ),

  /**
   * Birthday reminders
   * Birthday reminders about users you follow.
   *
   * Requires features{@link Features.birthdays}.
   */
  getBirthdays: async (day: number, month: number) => {
    const response = await client.request('/api/v1/pleroma/birthdays', { params: { day, month } });

    return v.parse(filteredArray(accountSchema), response.json);
  },

  /**
   * Returns favorites timeline of any user
   *
   * Requires features{@link Features.publicFavourites}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaaccountsidfavourites}
   */
  getAccountFavourites: (accountId: string, params?: GetAccountFavouritesParams) =>
    client.paginatedGet(
      `/api/v1/pleroma/accounts/${accountId}/favourites`,
      { params },
      statusSchema,
    ),

  /**
   * Interact with profile or status from remote account
   *
   * Requires features{@link Features.remoteInteractions}.
   * @param ap_id - Profile or status ActivityPub ID
   * @param profile - Remote profile webfinger
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromaremote_interaction}
   */
  remoteInteraction: async (ap_id: string, profile: string) => {
    const response = await client.request('/api/v1/pleroma/remote_interaction', {
      method: 'POST',
      body: { ap_id, profile },
    });

    if (response.json?.error) throw response.json.error;

    return v.parse(
      v.object({
        url: v.string(),
      }),
      response.json,
    );
  },

  /**
   * Bite the given user.
   *
   * Requires features{@link Features.bites}.
   * @see {@link https://github.com/purifetchi/Toki/blob/master/Toki/Controllers/MastodonApi/Bite/BiteController.cs}
   */
  biteAccount: async (accountId: string) => {
    let response;
    switch (client.features.version.software) {
      case ICESHRIMP_NET:
        response = await client.request<EmptyObject>('/api/v1/bite', {
          method: 'POST',
          body: accountId,
        });
        break;
      default:
        response = await client.request<EmptyObject>('/api/v1/bite', {
          method: 'POST',
          params: { id: accountId },
        });
        break;
    }

    return response.json;
  },

  /**
   * Requests a list of current and recent Listen activities for an account
   *
   * Requires features{@link Features.scrobbles}
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromaaccountsidscrobbles}
   */
  getScrobbles: (accountId: string, params?: GetScrobblesParams) =>
    client.paginatedGet(
      `/api/v1/pleroma/accounts/${accountId}/scrobbles`,
      { params },
      scrobbleSchema,
    ),

  /**
   * Creates a new Listen activity for an account
   *
   * Requires features{@link Features.scrobbles}
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromascrobble}
   */
  createScrobble: async (params: CreateScrobbleParams) => {
    if (params.external_link) (params as any).externalLink = params.external_link;

    const response = await client.request('/api/v1/pleroma/scrobble', { body: params });

    return v.parse(scrobbleSchema, response.json);
  },

  /**
   * Load latest activities from outbox
   *
   * Requires features{@link Features.loadActivities}
   */
  loadActivities: async (accountId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/accounts/${accountId}/load_activities`,
      { method: 'POST' },
    );

    return response.json;
  },

  subscribeByEmail: async (accountId: string, email: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/accounts/${accountId}/email_subscriptions`,
      { method: 'POST', body: { email } },
    );

    return response.json;
  },
});

export { accounts };
