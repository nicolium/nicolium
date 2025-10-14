import type { PlApiClient } from 'pl-api';
import type { AnyAction } from 'redux';

interface State {
  socket: ReturnType<(InstanceType<typeof PlApiClient>)['shoutbox']['connect']> | null;
}

const initialState: State = {
  socket: null,
};

const shoutboxReducer = (state = initialState, action: AnyAction) => state;

export { shoutboxReducer as default };
