import * as v from 'valibot';

import { authorizationServerMetadataSchema, tokenSchema, userInfoSchema } from '@/entities';
import { ICESHRIMP_NET } from '@/features';

import type { PlApiBaseClient } from '@/client-base';
import type {
  GetTokenParams,
  MfaChallengeParams,
  OauthAuthorizeParams,
  RevokeTokenParams,
} from '@/params/oauth';
import type { EmptyObject } from '@/utils/types';

const oauth = (client: PlApiBaseClient) => ({
  /**
   * Authorize a user
   * Displays an authorization form to the user. If approved, it will create and return an authorization code, then redirect to the desired `redirect_uri`, or show the authorization code if `urn:ietf:wg:oauth:2.0:oob` was requested. The authorization code can be used while requesting a token to obtain access to user-level methods.
   * @see {@link https://docs.joinmastodon.org/methods/oauth/#authorize}
   */
  authorize: async (params: OauthAuthorizeParams) => {
    const response = await client.request('/oauth/authorize', { params, formData: true });

    return v.parse(v.string(), response.json);
  },

  /**
   * Obtain a token
   * Obtain an access token, to be used during API calls that are not public.
   * @see {@link https://docs.joinmastodon.org/methods/oauth/#token}
   */
  getToken: async (params: GetTokenParams) => {
    if (client.features.version.software === ICESHRIMP_NET && params.grant_type === 'password') {
      const loginResponse = (
        await client.request<{
          token: string;
        }>('/api/iceshrimp/auth/login', {
          method: 'POST',
          body: {
            username: params.username,
            password: params.password,
          },
        })
      ).json;
      client.setIceshrimpAccessToken(loginResponse.token);

      const mastodonTokenResponse = (
        await client.request<{
          id: string;
          token: string;
          created_at: string;
          scopes: Array<string>;
        }>('/api/iceshrimp/sessions/mastodon', {
          method: 'POST',
          body: {
            appName: params.client_id,
            scopes: params.scope?.split(' '),
            flags: {
              supportsHtmlFormatting: true,
              autoDetectQuotes: false,
              isPleroma: true,
              supportsInlineMedia: true,
            },
          },
        })
      ).json;

      return v.parse(tokenSchema, {
        access_token: mastodonTokenResponse.token,
        token_type: 'Bearer',
        scope: mastodonTokenResponse.scopes.join(' '),
        created_at: new Date(mastodonTokenResponse.created_at).getTime(),
        id: mastodonTokenResponse.id,
      });
    }
    const response = await client.request('/oauth/token', {
      method: 'POST',
      body: params,
      formData: true,
    });

    return v.parse(tokenSchema, { scope: params.scope || '', ...response.json });
  },

  /**
   * Revoke a token
   * Revoke an access token to make it no longer valid for use.
   * @see {@link https://docs.joinmastodon.org/methods/oauth/#revoke}
   */
  revokeToken: async (params: RevokeTokenParams) => {
    const response = await client.request<EmptyObject>('/oauth/revoke', {
      method: 'POST',
      body: params,
      formData: true,
    });

    client.socket?.close();

    return response.json;
  },

  /**
   * Retrieve user information
   * Retrieves standardised OIDC claims about the currently authenticated user.
   * see {@link https://docs.joinmastodon.org/methods/oauth/#userinfo}
   */
  userinfo: async () => {
    const response = await client.request('/oauth/userinfo');

    return v.parse(userInfoSchema, response.json);
  },

  authorizationServerMetadata: async () => {
    const response = await client.request('/.well-known/oauth-authorization-server');

    return v.parse(authorizationServerMetadataSchema, response.json);
  },

  /**
   * Get a new captcha
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#apiv1pleromacaptcha}
   */
  getCaptcha: async () => {
    const response = await client.request('/api/pleroma/captcha');

    return v.parse(
      v.intersect([
        v.object({
          type: v.string(),
        }),
        v.record(v.string(), v.any()),
      ]),
      response.json,
    );
  },

  mfaChallenge: async (params: MfaChallengeParams) => {
    const response = await client.request('/oauth/mfa/challenge', { method: 'POST', body: params });

    return v.parse(tokenSchema, response.json);
  },
});

export { oauth };
