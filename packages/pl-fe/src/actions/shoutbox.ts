import { getClient } from 'pl-fe/api';

import { importEntities } from './importer';
import { getMeUrl } from './me';

import type { PlApiClient, ShoutMessage } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const SHOUTBOX_MESSAGE_IMPORT = 'SHOUTBOX_MESSAGE_IMPORT' as const;
const SHOUTBOX_MESSAGES_IMPORT = 'SHOUTBOX_MESSAGES_IMPORT' as const;
const SHOUTBOX_CONNECT = 'SHOUTBOX_CONNECT' as const;

const importShoutboxMessages = (messages: ShoutMessage[]) => (dispatch: AppDispatch): ShoutboxAction => {
  dispatch(importEntities({ accounts: messages.map((message) => message.author) }, { override: false }));

  return dispatch({
    type: SHOUTBOX_MESSAGES_IMPORT,
    messages,
  });
};

const importShoutboxMessage = (message: ShoutMessage) => (dispatch: AppDispatch): ShoutboxAction => {
  dispatch(importEntities({ accounts: [message.author] }, { override: false }));

  return dispatch({
    type: SHOUTBOX_MESSAGE_IMPORT,
    message,
  });
};

const createShoutboxMessage = (message: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const socket = getState().shoutbox.socket;

  if (!socket) return;

  socket.message(message);
};

const connectShoutbox = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const accountUrl = getMeUrl(state);

  if (!accountUrl) return;

  const client = getClient(state);

  return client.settings.verifyCredentials().then((account) => {
    if (account.__meta.pleroma?.chat_token) {
      const socket = client.shoutbox.connect(account.__meta.pleroma?.chat_token, {
        onMessage: (message) => dispatch(importShoutboxMessage(message)),
        onMessages: (messages) => dispatch(importShoutboxMessages(messages)),
      });
      return dispatch({
        type: SHOUTBOX_CONNECT,
        socket,
      });
    }
  });
};

type ShoutboxAction =
  | {
    type: typeof SHOUTBOX_CONNECT;
    socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']>;
  }
  | {
    type: typeof SHOUTBOX_MESSAGE_IMPORT;
    message: ShoutMessage;
  }
  | {
    type: typeof SHOUTBOX_MESSAGES_IMPORT;
    messages: ShoutMessage[];
  }

export {
  SHOUTBOX_MESSAGES_IMPORT,
  SHOUTBOX_MESSAGE_IMPORT,
  SHOUTBOX_CONNECT,
  importShoutboxMessages,
  importShoutboxMessage,
  connectShoutbox,
  createShoutboxMessage,
  type ShoutboxAction,
};
