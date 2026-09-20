import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { decodeSystemFromAvatar, type PluraldawnSystem } from '@/utils/pluraldawn';

import { backendUrl } from './auth';
import { useSettings } from './settings';

type EmojiMatch = { shortcode: string; url: string };

type State = {
  systems: Record<string, Record<string, PluraldawnSystem[0]> | 'pending'>;
  matches: Record<string, EmojiMatch>;

  actions: {
    setMatch: (statusId: string, emoji: EmojiMatch) => void;
    fetchSystem: (accountId: string, scopeUrl?: string) => void | Promise<PluraldawnSystem>;
  };
};

const usePluraldawnStore = create<State>()(
  mutative((set) => ({
    systems: {},
    matches: {},

    actions: {
      setMatch: (statusId: string, emoji: EmojiMatch) => {
        set((state) => {
          state.matches[statusId] = emoji;
        });
      },
      fetchSystem: (accountId: string, scopeUrl: string = backendUrl || window.origin) => {
        const key = `${new URL(scopeUrl).origin}:${accountId}`;
        const account = queryClient.getQueryData(
          scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
        );

        if (usePluraldawnStore.getState().systems[key]) return;

        set((state) => {
          if (!account) state.systems[key] = {};
          else state.systems[key] = 'pending';
        });

        if (!account) return;

        return decodeSystemFromAvatar(account.avatar_static).then((system) => {
          set((state) => {
            state.systems[key] = {};
            for (const member of system) {
              if (typeof member.emoji === 'string') {
                state.systems[key][member.emoji] = member;
              } else {
                for (const emoji of member.emoji) {
                  state.systems[key][emoji] = member;
                }
              }
            }
          });
          return system;
        });
      },
    },
  })),
);

const usePluraldawnActions = () => usePluraldawnStore((state) => state.actions);

const usePluraldawnMatch = (statusId?: string) => {
  const { pluraldawn: pluraldawnSettings } = useSettings();
  return usePluraldawnStore((state) =>
    pluraldawnSettings?.enabled && statusId ? state.matches[statusId] : undefined,
  );
};

const useSystemForAccount = (accountId: string) => {
  const scopeUrl = useScopeUrl();
  const key = `${new URL(scopeUrl).origin}:${accountId}`;

  return usePluraldawnStore((state) => state.systems[key]);
};

export {
  usePluraldawnStore,
  usePluraldawnActions,
  usePluraldawnMatch,
  useSystemForAccount,
  type EmojiMatch,
};
