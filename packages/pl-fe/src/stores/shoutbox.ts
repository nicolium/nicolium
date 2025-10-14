import { useEffect } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { useClient } from 'pl-fe/hooks/use-client';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { PlApiClient, ShoutMessage as BaseShoutMessage } from 'pl-api';

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
};

const useShoutboxStore = create<State>()(mutative((set) => ({
  socket: null,
  messages: [],
  isLoading: true,
  setMessages: (messages: Array<BaseShoutMessage>) => set((state: State) => {
    state.messages = messages.map(minifyMessage);
    state.isLoading = false;
  }),
  pushMessage: (message: BaseShoutMessage) => set((state: State) => {
    state.messages.push(minifyMessage(message));
  }),
}), {
  enableAutoFreeze: false,
}));

const useShoutboxSubscription = () => {
  const client = useClient();
  const instance = useInstance();
  const { isLoggedIn } = useLoggedIn();
  const shoutboxStore = useShoutboxStore();

  useEffect(() => {
    if (!(instance.fetched && isLoggedIn)) return;

    let socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']>;

    client.settings.verifyCredentials().then((account) => {
      if (account.__meta.pleroma?.chat_token) {
        socket = client.shoutbox.connect(account.__meta.pleroma?.chat_token, {
          onMessage: (message) => shoutboxStore.pushMessage(message),
          onMessages: (messages) => shoutboxStore.setMessages(messages),
        });
      }
    }).catch(() => {});

    return () => {
      socket?.close();
    };
  }, [instance.fetched && isLoggedIn]);
};

const useCreateShoutboxMessage = () => {
  const { socket } = useShoutboxStore();
  return { mutate: socket?.message };
};

export { useShoutboxStore, useShoutboxSubscription, useCreateShoutboxMessage, type ShoutMessage };
