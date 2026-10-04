import { makeRedirectUri } from 'expo-auth-session';
import { DraftedObject } from 'mutative';
import { PlApiClient, type RevokeTokenParams, type Features } from 'pl-api';
import { v4 as uuid } from 'uuid';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { queryClient } from '@/queries/client';
import { filteredRecord } from '@/utils/schemas';
import { getInstanceScopes } from '@/utils/scopes';
import { SecureishStore } from '@/utils/secureish-store';

import { useTimelinesStore } from './timelines';

const authSessionSchema = v.object({
  instance: v.string(),
  client_id: v.string(),
  client_secret: v.string(),
  access_token: v.string(),
  iceshrimp_access_token: v.fallback(v.nullable(v.string()), null),
});

type AuthSession = v.InferOutput<typeof authSessionSchema>;

const pendingAuthSchema = v.object({
  instance: v.string(),
  client_id: v.fallback(v.nullable(v.string()), null),
  client_secret: v.fallback(v.nullable(v.string()), null),
});

type PendingAuth = v.InferOutput<typeof pendingAuthSchema>;

interface AuthStore {
  sessions: Record<string, AuthSession>;
  clients: Record<string, PlApiClient>;
  currentAccount: string | null;
  pendingAuth: PendingAuth | null;
  pendingAuthClient: PlApiClient | null;
  actions: {
    fetchInstance: (instance: string) => Promise<void>;
    createApp: (grantType: 'password' | 'authorization_code') => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signInWithCode: (code: string, codeVerifier: string) => Promise<void>;
    signOut: () => void;
  };
}

const useAuthStore = create<AuthStore>()(
  mutative((set, get) => {
    const serializedSessions = SecureishStore.getItem('sessions');
    const rememberedSessions: Record<string, AuthSession> = serializedSessions
      ? v.parse(filteredRecord(v.string(), authSessionSchema), JSON.parse(serializedSessions))
      : {};

    const serializedPendingAuth = SecureishStore.getItem('pendingAuth');
    const parsedPendingAuth = v.safeParse(
      pendingAuthSchema,
      JSON.stringify(serializedPendingAuth || ''),
    );
    const rememberedPendingAuth = parsedPendingAuth.success ? parsedPendingAuth.output : null;

    const currentAccount = SecureishStore.getItem('currentAccount');

    const persistSessions = ({
      sessions,
      currentAccount,
      pendingAuth,
    }: DraftedObject<AuthStore>) => {
      SecureishStore.setItem('sessions', JSON.stringify(sessions));
      SecureishStore.setItem('pendingAuth', JSON.stringify(pendingAuth));

      if (currentAccount) {
        SecureishStore.setItem('currentAccount', currentAccount);
      } else {
        SecureishStore.removeItem('currentAccount');
      }
    };

    return {
      sessions: rememberedSessions,
      clients: Object.fromEntries(
        Object.entries(rememberedSessions).map(([id, session]) => [
          id,
          new PlApiClient(session.instance, session.access_token, {
            iceshrimpAccessToken: session.iceshrimp_access_token || undefined,
            fetchInstance: true,
          }),
        ]),
      ),
      currentAccount,
      pendingAuth: rememberedPendingAuth,
      pendingAuthClient: rememberedPendingAuth
        ? new PlApiClient(rememberedPendingAuth.instance, undefined, {
            fetchInstance: true,
          })
        : null,
      actions: {
        fetchInstance: (instance) => {
          return new Promise((resolve, reject) => {
            const client = new PlApiClient(instance, undefined, {
              fetchInstance: true,
              onInstanceFetchSuccess: () => {
                set((state) => {
                  state.pendingAuth = {
                    instance,
                    client_id: null,
                    client_secret: null,
                  };
                  state.pendingAuthClient = client;

                  persistSessions(state);
                });
                resolve();
              },
              onInstanceFetchError: () => reject(),
            });
          });
        },
        createApp: async (grantType) => {
          const { pendingAuth, pendingAuthClient: client } = get();

          if (!client || !pendingAuth?.instance) return;

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
            state.pendingAuth = {
              instance: pendingAuth.instance,
              client_id,
              client_secret,
            };

            persistSessions(state);
          });
        },
        signIn: async (username, password) => {
          const { pendingAuth, pendingAuthClient: client } = get();

          if (!client || !pendingAuth?.instance) return;

          const { access_token } = await client.oauth.getToken({
            client_id: pendingAuth.client_id!,
            client_secret: pendingAuth.client_secret!,
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
            grant_type: 'password',
            username: username,
            password,
            scope: getInstanceScopes(client.instanceInformation),
          });

          client.accessToken = access_token;

          set((state) => {
            const sessionUUID = uuid();

            state.sessions[sessionUUID] = {
              instance: pendingAuth.instance,
              client_id: pendingAuth.client_id!,
              client_secret: pendingAuth.client_secret!,
              access_token,
              iceshrimp_access_token: null,
            };
            state.clients[sessionUUID] = client;
            state.currentAccount = sessionUUID;
            state.pendingAuth = null;

            persistSessions(state);
          });
        },
        signInWithCode: async (code, codeVerifier) => {
          const { pendingAuth, pendingAuthClient: client } = get();

          if (!client || !pendingAuth?.instance) return;

          const { access_token } = await client.oauth.getToken({
            client_id: pendingAuth.client_id!,
            client_secret: pendingAuth.client_secret!,
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
            const sessionUUID = uuid();

            state.sessions[sessionUUID] = {
              instance: pendingAuth.instance,
              client_id: pendingAuth.client_id!,
              client_secret: pendingAuth.client_secret!,
              access_token,
              iceshrimp_access_token: null,
            };
            state.clients[sessionUUID] = client;
            state.currentAccount = sessionUUID;
            state.pendingAuth = null;

            persistSessions(state);
          });
        },
        signOut: () => {
          const { currentAccount, clients, sessions } = get();

          if (!currentAccount) return null;

          const currentSession = sessions[currentAccount];

          clients[currentAccount].oauth.revokeToken({
            client_id: currentSession.client_id,
            client_secret: currentSession.client_secret,
            token: currentSession.access_token,
          } as RevokeTokenParams);

          queryClient.removeQueries({ queryKey: [currentSession.instance] });
          useTimelinesStore.getState().actions.resetTimelines(currentSession.instance);

          set((state) => {
            delete state.sessions[currentAccount];
            delete state.clients[currentAccount];
            state.currentAccount = Object.keys(state.sessions)[0] || null;

            persistSessions(state);
          });
        },
      },
    };
  }),
);

const useAuthStoreActions = () => useAuthStore(({ actions }) => actions);

const useClient = () =>
  useAuthStore((state) => (state.currentAccount ? state.clients[state.currentAccount] : null)!);

const useInstance = () => useClient().instanceInformation;

const useFeatures = (): Features => useClient().features;

export { useAuthStore, useAuthStoreActions, useClient, useInstance, useFeatures };
