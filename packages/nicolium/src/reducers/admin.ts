import { create } from 'mutative';

import {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  // ADMIN_USER_DELETE_SUCCESS,
  type AdminActions,
} from '@/actions/admin';

import type { Config } from '@/utils/config-db';

interface State {
  configs: Array<Config>;
  needsReboot: boolean;
}

const initialState: State = {
  configs: [],
  needsReboot: false,
};

const importConfigs = (state: State, configs: Array<Config>) => {
  state.configs = configs;
};

const admin = (state = initialState, action: AdminActions): State => {
  switch (action.type) {
    case ADMIN_CONFIG_FETCH_SUCCESS:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return create(state, (draft) => {
        importConfigs(draft, action.configs);
      });
    default:
      return state;
  }
};

export { admin as default };
