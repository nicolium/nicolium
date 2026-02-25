import { combineReducers } from '@reduxjs/toolkit';

import { AUTH_LOGGED_OUT } from '@/actions/auth';
import * as BuildConfig from '@/build-config';

import admin from './admin';
import auth from './auth';
import filters from './filters';
import frontendConfig from './frontend-config';
import instance from './instance';
import me from './me';
import meta from './meta';
import pushNotifications from './push-notifications';
import statuses from './statuses';
import timelines from './timelines';

const reducers = {
  admin,
  auth,
  filters,
  frontendConfig,
  instance,
  me,
  meta,
  pushNotifications,
  statuses,
  timelines,
};

const appReducer = combineReducers(reducers);

type AppState = ReturnType<typeof appReducer>;

// Clear the state (mostly) when the user logs out
const logOut = (state: AppState): ReturnType<typeof appReducer> => {
  if (BuildConfig.NODE_ENV === 'production') {
    location.href = '/login';
  }

  const newState = rootReducer(undefined, { type: '' });

  const { instance, frontendConfig, auth } = state;
  return { ...newState, instance, frontendConfig, auth };
};

const rootReducer: typeof appReducer = (state, action) => {
  switch (action.type) {
    case AUTH_LOGGED_OUT:
      return appReducer(logOut(state as AppState), action);
    default:
      return appReducer(state, action);
  }
};

export default appReducer;
