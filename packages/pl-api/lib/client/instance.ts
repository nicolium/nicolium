import * as v from 'valibot';

import {
  accountSchema,
  customEmojiSchema,
  domainBlockSchema,
  extendedDescriptionSchema,
  instanceSchema,
  privacyPolicySchema,
  ruleSchema,
  termsOfServiceSchema,
} from '../entities';
import { filteredArray } from '../entities/utils';
import { AKKOMA, MITRA } from '../features';

import type { PlApiBaseClient } from '../client-base';
import type { ProfileDirectoryParams } from '../params/instance';

const instance = (client: PlApiBaseClient) => ({
  /**
   * View server information
   * Obtain general information about the server.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#v2}
   */
  getInstance: async () => {
    let response;
    try {
      response = await client.request('/api/v2/instance');
    } catch (e) {
      response = await client.request('/api/v1/instance');
    }

    const instance = v.parse(v.pipe(instanceSchema, v.readonly()), response.json);
    client.setInstance(instance);

    return instance;
  },

  /**
   * List of connected domains
   * Domains that this instance is aware of.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#peers}
   */
  getInstancePeers: async () => {
    const response = await client.request('/api/v1/instance/peers');

    return v.parse(v.array(v.string()), response.json);
  },

  /**
   * Weekly activity
   * Instance activity over the last 3 months, binned weekly.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#activity}
   */
  getInstanceActivity: async () => {
    const response = await client.request('/api/v1/instance/activity');

    return v.parse(
      v.array(
        v.object({
          week: v.string(),
          statuses: v.pipe(v.unknown(), v.transform(String)),
          logins: v.pipe(v.unknown(), v.transform(String)),
          registrations: v.pipe(v.unknown(), v.transform(String)),
        }),
      ),
      response.json,
    );
  },

  /**
   * List of rules
   * Rules that the users of this service should follow.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#rules}
   */
  getInstanceRules: async () => {
    const response = await client.request('/api/v1/instance/rules');

    return v.parse(filteredArray(ruleSchema), response.json);
  },

  /**
   * View moderated servers
   * Obtain a list of domains that have been blocked.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#domain_blocks}
   */
  getInstanceDomainBlocks: async () => {
    const response = await client.request('/api/v1/instance/rules');

    return v.parse(filteredArray(domainBlockSchema), response.json);
  },

  /**
   * View extended description
   * Obtain an extended description of this server
   * @see {@link https://docs.joinmastodon.org/methods/instance/#extended_description}
   */
  getInstanceExtendedDescription: async () => {
    const response = await client.request('/api/v1/instance/extended_description');

    return v.parse(extendedDescriptionSchema, response.json);
  },

  /**
   * View translation languages
   * Translation language pairs supported by the translation engine used by the server.
   * @see {@link https://docs.joinmastodon.org/methods/instance/#translation_languages}
   */
  getInstanceTranslationLanguages: async () => {
    if (client.features.version.software === AKKOMA) {
      const response = await client.request<{
        source: Array<{ code: string; name: string }>;
        target: Array<{ code: string; name: string }>;
      }>('/api/v1/akkoma/translation/languages');

      return Object.fromEntries(
        response.json.source.map((source) => [
          source.code.toLocaleLowerCase(),
          response.json.target
            .map((lang) => lang.code)
            .filter((lang) => lang !== source.code)
            .map((lang) => lang.toLocaleLowerCase()),
        ]),
      );
    }

    const response = await client.request('/api/v1/instance/translation_languages');

    return v.parse(v.record(v.string(), v.array(v.string())), response.json);
  },

  /**
   * View profile directory
   * List accounts visible in the directory.
   * @see {@link https://docs.joinmastodon.org/methods/directory/#get}
   *
   * Requires features{@link Features.profileDirectory}.
   */
  profileDirectory: async (params?: ProfileDirectoryParams) => {
    const response = await client.request('/api/v1/directory', { params });

    return v.parse(filteredArray(accountSchema), response.json);
  },

  /**
   * View all custom emoji
   * Returns custom emojis that are available on the server.
   * @see {@link https://docs.joinmastodon.org/methods/custom_emojis/#get}
   */
  getCustomEmojis: async () => {
    const response = await client.request('/api/v1/custom_emojis');

    return v.parse(filteredArray(customEmojiSchema), response.json);
  },

  /**
   * Dump frontend configurations
   *
   * Requires features{@link Features.frontendConfigurations}.
   */
  getFrontendConfigurations: async () => {
    let response;

    switch (client.features.version.software) {
      case MITRA:
        response = (await client.request('/api/v1/accounts/verify_credentials')).json
          ?.client_config;
        break;
      default:
        response = (await client.request('/api/pleroma/frontend_configurations')).json;
    }

    return v.parse(v.fallback(v.record(v.string(), v.record(v.string(), v.any())), {}), response);
  },

  /**
   * View privacy policy
   * Obtain the contents of this server's privacy policy.
   * @see {@link https://docs.joinmastodon.org/methods/instance/privacy_policy}
   */
  getInstancePrivacyPolicy: async () => {
    const response = await client.request('/api/v1/instance/privacy_policy');

    return v.parse(privacyPolicySchema, response.json);
  },

  /**
   * View terms of service
   * Obtain the contents of this server's terms of service, if configured.
   * @see {@link https://docs.joinmastodon.org/methods/instance/terms_of_service}
   */
  getInstanceTermsOfService: async () => {
    const response = await client.request('/api/v1/instance/terms_of_service');

    return v.parse(termsOfServiceSchema, response.json);
  },

  /**
   * View a specific version of the terms of service
   * Obtain the contents of this server's terms of service, for a specified date, if configured.
   * @see {@link https://docs.joinmastodon.org/methods/instance/terms_of_service_date}
   */
  getInstanceTermsOfServiceForDate: async (date: string) => {
    const response = await client.request(`/api/v1/instance/terms_of_service/${date}`);

    return v.parse(termsOfServiceSchema, response.json);
  },
});

export { instance };
