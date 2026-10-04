import { PlApiClient, type Features } from 'pl-api';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { queryClient } from '@/queries/client';
import { getInstanceScopes } from '@/utils/scopes';

import { useTimelinesStore } from './timelines';

interface AuthData {
  instance: string | null;
  token: string | null;
}

interface AuthStore extends AuthData {
  client: PlApiClient;
  actions: {
    fetchInstance: (instance: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    setToken: (token: string) => Promise<void>;
    signOut: () => void;
  };
}

const useAuthStore = create<AuthStore>()(
  mutative((set, get) => ({
    instance: null,
    token: null,
    client: null as any,
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
      signIn: async (username, password) => {
        const { client } = get();

        const { client_id, client_secret } = await client.apps.createApplication({
          client_name: 'Nicolium (mobile)',
          redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
          scopes: getInstanceScopes(client.instanceInformation),
          website: 'https://nicolium.app',
        });
        const { access_token } = await client.oauth.getToken({
          client_id,
          client_secret,
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
      setToken: async (token) => {
        const { client } = get();
        client.accessToken = token;

        await client.settings.verifyCredentials();

        set((state) => {
          state.token = token;
        });
      },
      signOut: () => {
        set((state) => {
          queryClient.removeQueries({ queryKey: [state.instance] });
          useTimelinesStore.getState().actions.resetTimelines(state.instance!);

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
