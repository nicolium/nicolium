import { type PlApiClient, type ShoutMessage as BaseShoutMessage, Account } from 'pl-api';
import { useEffect } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';

const minifyMessage = ({ author, ...message }: BaseShoutMessage) => ({
  author_id: author.id,
  ...message,
});

type ShoutMessage = ReturnType<typeof minifyMessage>;

type State = {
  socket: ReturnType<InstanceType<typeof PlApiClient>['shoutbox']['connect']> | null;
  messages: Array<ShoutMessage>;
  isLoading: boolean;
  actions: {
    setMessages: (messages: Array<BaseShoutMessage>) => void;
    pushMessage: (message: BaseShoutMessage) => void;
    setSocket: (socket: State['socket']) => void;
  };
};

const useShoutboxStore = create<State>()(
  mutative(
    (set) => ({
      socket: null,
      messages: [],
      isLoading: true,
      actions: {
        setMessages: (messages) => {
          set((state: State) => {
            for (const { author } of messages.toReversed()) {
              queryClient.setQueryData<Account>(
                queryKeys.accounts.show(author.id),
                (account) => account || author,
              );
            }
            state.messages = messages.map(minifyMessage);
            state.isLoading = false;
          });
        },
        pushMessage: (message) => {
          set((state: State) => {
            queryClient.setQueryData<Account>(
              queryKeys.accounts.show(message.author.id),
              message.author,
            );
            state.messages.push(minifyMessage(message));
          });
        },
        setSocket: (socket) => {
          set((state: State) => {
            state.socket = socket;
          });
        },
      },
    }),
    {
      enableAutoFreeze: false,
    },
  ),
);

const useShoutboxMessages = () => useShoutboxStore((state) => state.messages);
const useShoutboxIsLoading = () => useShoutboxStore((state) => state.isLoading);
const useShoutboxSocket = () => useShoutboxStore((state) => state.socket);
const useShoutboxActions = () => useShoutboxStore((state) => state.actions);

const useShoutboxSubscription = () => {
  const client = useClient();
  const { shoutbox: shoutboxAvailable } = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const shoutboxStore = useShoutboxActions();

  useEffect(() => {
    if (!(shoutboxAvailable && isLoggedIn)) return;

    let socket: ReturnType<InstanceType<typeof PlApiClient>['shoutbox']['connect']>;

    client.settings
      .verifyCredentials()
      .then((account) => {
        if (account.__meta.pleroma?.chat_token) {
          socket = client.shoutbox.connect(account.__meta.pleroma?.chat_token, {
            onMessage: (message) => {
              shoutboxStore.pushMessage(message);
            },
            onMessages: (messages) => {
              shoutboxStore.setMessages(messages);
            },
          });
          shoutboxStore.setSocket(socket);
        }
      })
      .catch(() => {});

    return () => {
      socket?.close();
      shoutboxStore.setSocket(null);
    };
  }, [shoutboxAvailable && isLoggedIn]);
};

const useCreateShoutboxMessage = () => {
  const socket = useShoutboxSocket();
  return { mutate: socket?.message };
};

export {
  useShoutboxStore,
  useShoutboxMessages,
  useShoutboxIsLoading,
  useShoutboxSubscription,
  useCreateShoutboxMessage,
  type ShoutMessage,
};
