import * as v from 'valibot';

import { instanceSchema } from './entities/instance';
import { filteredArray } from './entities/utils';
import { type Features, getFeatures } from './features';
import request, { getNextLink, getPrevLink, type RequestBody } from './request';

import type { Instance } from './entities/instance';
import type { Response as PlApiResponse } from './request';
import type { PaginatedResponse } from './responses';

interface PlApiClientConstructorOpts {
  /** Instance object to use by default, to be populated eg. from cache */
  instance?: Instance;
  /** Custom authorization token to use for requests */
  customAuthorizationToken?: string;
}

/**
 * Base Mastodon API client.
 * For example usage, see {@link PlApiClient}.
 * @category Clients
 */
class PlApiBaseClient {
  baseURL: string;
  #accessToken?: string;
  #iceshrimpAccessToken?: string;
  #customAuthorizationToken?: string;
  #instance: Instance = v.parse(instanceSchema, {});
  public request = request.bind(this) as typeof request;
  public features: Features = getFeatures(this.#instance);
  /** @internal */
  socket?: {
    listen: (listener: any, stream?: string) => number;
    unlisten: (listener: any) => void;
    subscribe: (stream: string, params?: { list?: string; tag?: string }) => void;
    unsubscribe: (stream: string, params?: { list?: string; tag?: string }) => void;
    close: () => void;
  };
  /** @internal */
  shoutSocket?: {
    message: (text: string) => void;
    close: () => void;
  };

  /**
   * @param baseURL Mastodon API-compatible server URL
   * @param accessToken OAuth token for an authorized user
   */
  constructor(baseURL: string, accessToken?: string, opts: PlApiClientConstructorOpts = {}) {
    this.baseURL = baseURL;
    this.#accessToken = accessToken;
    this.#customAuthorizationToken = opts.customAuthorizationToken;

    if (opts.instance) {
      this.setInstance(opts.instance);
    }
  }

  /** @internal */
  paginatedGet = async <T, IsArray extends true | false = true>(
    input: URL | RequestInfo,
    body: RequestBody,
    schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>,
    isArray = true as IsArray,
  ): Promise<PaginatedResponse<T, typeof isArray>> => {
    const targetSchema = isArray ? filteredArray(schema) : schema;

    const processResponse = (response: PlApiResponse<any>) =>
      ({
        previous: getMore(getPrevLink(response)),
        next: getMore(getNextLink(response)),
        items: v.parse(targetSchema, response.json),
        partial: response.status === 206,
      }) as PaginatedResponse<T, IsArray>;

    const getMore = (input: string | null) =>
      input ? () => this.request(input).then(processResponse) : null;

    const response = await this.request(input, body);

    return processResponse(response);
  };

  /** @internal */
  setInstance = (instance: Instance) => {
    this.#instance = instance;
    this.features = getFeatures(this.#instance);
  };

  /** @internal */
  getIceshrimpAccessToken = async (): Promise<void> => {
    // No-op in the base client, overridden in PlApiClient
  };

  /** @internal */
  setIceshrimpAccessToken(token: string) {
    this.#iceshrimpAccessToken = token;
  }

  get accessToken(): string | undefined {
    return this.#accessToken;
  }

  set accessToken(accessToken: string | undefined) {
    if (this.#accessToken === accessToken) return;

    this.socket?.close();
    this.#accessToken = accessToken;

    this.getIceshrimpAccessToken();
  }

  get iceshrimpAccessToken(): string | undefined {
    return this.#iceshrimpAccessToken;
  }

  get customAuthorizationToken(): string | undefined {
    return this.#customAuthorizationToken;
  }

  set customAuthorizationToken(token: string | undefined) {
    this.#customAuthorizationToken = token;
  }

  get instanceInformation() {
    return this.#instance;
  }
}

export { PlApiBaseClient, type PlApiClientConstructorOpts };
