import { SHOUTBOX_CONNECT, SHOUTBOX_MESSAGES_IMPORT, SHOUTBOX_MESSAGE_IMPORT, type ShoutboxAction } from 'pl-fe/actions/shoutbox';

import type { PlApiClient, ShoutMessage } from 'pl-api';

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

const shoutboxReducer = (state = initialState, action: ShoutboxAction) => {
  switch (action.type) {
    case SHOUTBOX_CONNECT:
      return { ...state, socket: action.socket };
    case SHOUTBOX_MESSAGES_IMPORT:
      return { ...state, messages: action.messages, isLoading: false };
    case SHOUTBOX_MESSAGE_IMPORT:
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
};

export { shoutboxReducer as default };
