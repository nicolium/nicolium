import { PlApiClient, type Features } from 'pl-api';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { queryClient } from '@/queries/client';

import { useTimelinesStore } from './timelines';

interface AuthData {
  instance: string | null;
  token: string | null;
}

interface AuthStore extends AuthData {
  client: PlApiClient;
  actions: {
    signIn: (instance: string, token: string) => Promise<void>;
    signOut: () => void;
  };
}

const useAuthStore = create<AuthStore>()(
  mutative((set) => ({
    instance: null,
    token: null,
    client: null as any,
    actions: {
      signIn: (instance, token) => {
        set((state) => {
          state.instance = instance;
          state.token = token;
        });

        return new Promise((resolve, reject) => {
          const client = new PlApiClient(instance, token, {
            fetchInstance: true,
            onInstanceFetchSuccess: () => {
              set((state) => {
                state.client = client;
              });
              resolve();
            },
            onInstanceFetchError: () => reject(),
          });
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
