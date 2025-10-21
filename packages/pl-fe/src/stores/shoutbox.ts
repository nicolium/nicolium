import { useEffect } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { importEntities } from 'pl-fe/actions/importer';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { PlApiClient, ShoutMessage as BaseShoutMessage } from 'pl-api';
import type { store } from 'pl-fe/store';

let lazyStore: typeof store;
import('pl-fe/store').then(({ store }) => lazyStore = store).catch(() => {});

const minifyMessage = ({ author, ...message }: BaseShoutMessage) => ({
  author_id: author.id,
  ...message,
});

type ShoutMessage = ReturnType<typeof minifyMessage>;

type State = {
  socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']> | null;
  messages: Array<ShoutMessage>;
  isLoading: boolean;
  setMessages: (messages: Array<BaseShoutMessage>) => void;
  pushMessage: (message: BaseShoutMessage) => void;
  setSocket: (socket: State['socket']) => void;
};

const useShoutboxStore = create<State>()(mutative((set) => ({
  socket: null,
  messages: [],
  isLoading: true,
  setMessages: (messages) => set((state: State) => {
    lazyStore?.dispatch(importEntities({ accounts: messages.map((msg) => msg.author) }, { override: false }) as any);
    state.messages = messages.map(minifyMessage);
    state.isLoading = false;
  }),
  pushMessage: (message) => set((state: State) => {
    lazyStore?.dispatch(importEntities({ accounts: [message.author] }) as any);
    state.messages.push(minifyMessage(message));
  }),
  setSocket: (socket) => set((state: State) => {
    state.socket = socket;
  }),
}), {
  enableAutoFreeze: false,
}));

const useShoutboxSubscription = () => {
  const client = useClient();
  const { shoutbox: shoutboxAvailable } = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const shoutboxStore = useShoutboxStore();

  useEffect(() => {
    if (!(shoutboxAvailable && isLoggedIn)) return;

    let socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']>;

    client.settings.verifyCredentials().then((account) => {
      if (account.__meta.pleroma?.chat_token) {
        socket = client.shoutbox.connect(account.__meta.pleroma?.chat_token, {
          onMessage: (message) => shoutboxStore.pushMessage(message),
          onMessages: (messages) => shoutboxStore.setMessages(messages),
        });
        shoutboxStore.setSocket(socket);
      }
    }).catch(() => {});

    return () => {
      socket?.close();
      shoutboxStore.setSocket(null);
    };
  }, [shoutboxAvailable && isLoggedIn]);
};

const useCreateShoutboxMessage = () => {
  const { socket } = useShoutboxStore();
  return { mutate: socket?.message };
};

export { useShoutboxStore, useShoutboxSubscription, useCreateShoutboxMessage, type ShoutMessage };
