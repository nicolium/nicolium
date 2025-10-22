import { combineReducers } from '@reduxjs/toolkit';

import { AUTH_LOGGED_OUT } from 'pl-fe/actions/auth';
import * as BuildConfig from 'pl-fe/build-config';
import entities from 'pl-fe/entity-store/reducer';

import accounts_meta from './accounts-meta';
import admin from './admin';
import auth from './auth';
import compose from './compose';
import contexts from './contexts';
import conversations from './conversations';
import filters from './filters';
import instance from './instance';
import me from './me';
import meta from './meta';
import notifications from './notifications';
import pending_statuses from './pending-statuses';
import plfe from './pl-fe';
import push_notifications from './push-notifications';
import statuses from './statuses';
import timelines from './timelines';

const reducers = {
  accounts_meta,
  admin,
  auth,
  compose,
  contexts,
  conversations,
  entities,
  filters,
  instance,
  me,
  meta,
  notifications,
  pending_statuses,
  plfe,
  push_notifications,
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

  const { instance, plfe, auth } = state;
  return { ...newState, instance, plfe, auth };
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
