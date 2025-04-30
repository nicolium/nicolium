import { getAuthUserUrl, getMeUrl } from 'pl-fe/utils/auth';

import { getClient, staticFetch } from '../api';

import type { Instance } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const INSTANCE_FETCH_SUCCESS = 'INSTANCE_FETCH_SUCCESS' as const;
const INSTANCE_FETCH_FAIL = 'INSTANCE_FETCH_FAIL' as const;
const STANDALONE_CHECK_SUCCESS = 'STANDALONE_CHECK_SUCCESS' as const;

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

interface InstanceFetchSuccessAction {
  type: typeof INSTANCE_FETCH_SUCCESS;
  instance: Instance;
}

interface InstanceFetchFailAction {
  type: typeof INSTANCE_FETCH_FAIL;
  error: unknown;
}

const fetchInstance = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const instance = await getClient(getState).instance.getInstance();

    dispatch<InstanceFetchSuccessAction>({ type: INSTANCE_FETCH_SUCCESS, instance });
  } catch (error) {
    dispatch({ type: INSTANCE_FETCH_FAIL, error });
  }
};

interface StandaloneCheckSuccessAction {
  type: typeof STANDALONE_CHECK_SUCCESS;
  ok: boolean;
}

const checkIfStandalone = () => (dispatch: AppDispatch) =>
  staticFetch('/api/v1/instance', { method: 'HEAD' })
    .then(({ ok, headers }) => dispatch<StandaloneCheckSuccessAction>({ type: STANDALONE_CHECK_SUCCESS, ok: ok && headers.get('content-type') === 'application/json' }))
    .catch((err) => dispatch<StandaloneCheckSuccessAction>({ type: STANDALONE_CHECK_SUCCESS, ok: err.response?.ok }));

type InstanceAction =
  InstanceFetchSuccessAction
  | InstanceFetchFailAction
  | StandaloneCheckSuccessAction

export {
  INSTANCE_FETCH_SUCCESS,
  INSTANCE_FETCH_FAIL,
  STANDALONE_CHECK_SUCCESS,
  getHost,
  fetchInstance,
  checkIfStandalone,
  type InstanceAction,
};
