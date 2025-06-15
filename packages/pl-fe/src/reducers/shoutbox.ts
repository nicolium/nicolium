import { SHOUTBOX_CONNECT, SHOUTBOX_MESSAGES_IMPORT, SHOUTBOX_MESSAGE_IMPORT, type ShoutboxAction } from 'pl-fe/actions/shoutbox';

import type { PlApiClient, ShoutMessage as BaseShoutMessage } from 'pl-api';

interface ShoutMessage extends Omit<BaseShoutMessage, 'author'> {
  author_id: string;
}

interface State {
  socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']> | null;
  isLoading: boolean;
  messages: Array<ShoutMessage>;
}

const initialState: State = {
  socket: null,
  isLoading: true,
  messages: [],
};

const minifyMessage = ({ author, ...message }: BaseShoutMessage): ShoutMessage => ({
  author_id: author.id,
  ...message,
});

const shoutboxReducer = (state = initialState, action: ShoutboxAction) => {
  switch (action.type) {
    case SHOUTBOX_CONNECT:
      return { ...state, socket: action.socket };
    case SHOUTBOX_MESSAGES_IMPORT:
      return { ...state, messages: action.messages.map(minifyMessage), isLoading: false };
    case SHOUTBOX_MESSAGE_IMPORT:
      return { ...state, messages: [...state.messages, minifyMessage(action.message)] };
    default:
      return state;
  }
};

export { shoutboxReducer as default, type ShoutMessage };
