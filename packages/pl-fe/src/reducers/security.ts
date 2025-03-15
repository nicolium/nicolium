import { create } from 'mutative';

import {
  MFA_FETCH_SUCCESS,
  MFA_CONFIRM_SUCCESS,
  MFA_DISABLE_SUCCESS,
  type MfaAction,
} from '../actions/mfa';

interface State {
  mfa: {
    settings: Record<string, boolean>;
  };
}

const initialState: State = {
  mfa: {
    settings: {
      totp: false,
    },
  },
};

const importMfa = (state: State, data: any) => state.mfa = data;

const enableMfa = (state: State, method: string) => state.mfa.settings = { ...state.mfa.settings, [method]: true };

const disableMfa = (state: State, method: string) => state.mfa.settings = { ...state.mfa.settings, [method]: false };

const security = (state = initialState, action: MfaAction) => {
  switch (action.type) {
    case MFA_FETCH_SUCCESS:
      return create(state, (draft) => {
        importMfa(draft, action.data);
      });
    case MFA_CONFIRM_SUCCESS:
      return create(state, (draft) => {
        enableMfa(draft, action.method);
      });
    case MFA_DISABLE_SUCCESS:
      return create(state, (draft) => {
        disableMfa(draft, action.method);
      });
    default:
      return state;
  }
};

export { security as default };
