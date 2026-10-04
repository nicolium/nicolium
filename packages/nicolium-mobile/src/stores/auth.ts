import { makeRedirectUri } from 'expo-auth-session';
import { PlApiClient, type RevokeTokenParams, type Features } from 'pl-api';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { queryClient } from '@/queries/client';
import { getInstanceScopes } from '@/utils/scopes';

import { useTimelinesStore } from './timelines';

interface AuthData {
  instance: string | null;
  client_id: string | null;
  client_secret: string | null;
  token: string | null;
}

interface AuthStore extends AuthData {
  client: PlApiClient;
  actions: {
    fetchInstance: (instance: string) => Promise<void>;
    createApp: (grantType: 'password' | 'authorization_code') => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signInWithCode: (code: string, codeVerifier: string) => Promise<void>;
    setToken: (token: string) => Promise<void>;
    signOut: () => void;
  };
}

const useAuthStore = create<AuthStore>()(
  mutative((set, get) => ({
    instance: null,
    client_id: null,
    client_secret: null,
    token: null,
    client: new PlApiClient(''),
    actions: {
      fetchInstance: (instance) => {
        return new Promise((resolve, reject) => {
          const client = new PlApiClient(instance, undefined, {
            fetchInstance: true,
            onInstanceFetchSuccess: () => {
              set((state) => {
                state.client = client;
                state.instance = instance;
              });
              resolve();
            },
            onInstanceFetchError: () => reject(),
          });
        });
      },
      createApp: async (grantType) => {
        const { client } = get();

        const { client_id, client_secret } = await client.apps.createApplication({
          client_name: 'Nicolium (mobile)',
          redirect_uris:
            grantType === 'authorization_code'
              ? makeRedirectUri({
                  scheme: 'nicolium',
                  path: 'redirect',
                })
              : 'urn:ietf:wg:oauth:2.0:oob',
          scopes: getInstanceScopes(client.instanceInformation),
          website: 'https://nicolium.app',
        });

        set((state) => {
          state.client_id = client_id;
          state.client_secret = client_secret;
        });
      },
      signIn: async (username, password) => {
        const { client, client_id, client_secret } = get();

        const { access_token } = await client.oauth.getToken({
          client_id: client_id!,
          client_secret: client_secret!,
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
          grant_type: 'password',
          username: username,
          password,
          scope: getInstanceScopes(client.instanceInformation),
        });

        client.accessToken = access_token;

        set((state) => {
          state.token = access_token;
        });
      },
      signInWithCode: async (code, codeVerifier) => {
        const { client, client_id, client_secret } = get();

        const { access_token } = await client.oauth.getToken({
          client_id: client_id!,
          client_secret: client_secret!,
          redirect_uri: makeRedirectUri({
            scheme: 'nicolium',
            path: 'redirect',
          }),
          grant_type: 'authorization_code',
          scope: getInstanceScopes(client.instanceInformation),
          code,
          code_verifier: codeVerifier,
        });

        client.accessToken = access_token;

        set((state) => {
          state.token = access_token;
        });
      },
      setToken: async (token) => {
        const { client } = get();
        client.accessToken = token;

        await client.settings.verifyCredentials();

        set((state) => {
          state.token = token;
        });
      },
      signOut: () => {
        const { client, instance, client_id, client_secret, token } = get();

        client.oauth.revokeToken({
          client_id,
          client_secret,
          token,
        } as RevokeTokenParams);

        queryClient.removeQueries({ queryKey: [instance] });
        useTimelinesStore.getState().actions.resetTimelines(instance!);

        set((state) => {
          state.instance = null;
          state.token = null;
          state.client = null as any;
        });
      },
    },
  })),
);

const useAuthStoreActions = () => useAuthStore().actions;

const useClient = () => useAuthStore().client;

const useInstance = () => useClient().instanceInformation;

const useFeatures = (): Features => useClient().features;

export { useAuthStore, useAuthStoreActions, useClient, useInstance, useFeatures };
