import { type CreateAccountParams, type Relationship } from 'pl-api';

import { batcher } from '@/api/batcher';
import { queryClient } from '@/queries/client';
import { selectAccount } from '@/selectors';
import { isLoggedIn } from '@/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { MinifiedStatus } from '@/reducers/statuses';
import type { AppDispatch, RootState } from '@/store';

const ACCOUNT_BLOCK_SUCCESS = 'ACCOUNT_BLOCK_SUCCESS' as const;
const ACCOUNT_MUTE_SUCCESS = 'ACCOUNT_MUTE_SUCCESS' as const;

const createAccount = (params: CreateAccountParams) =>
  async (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).settings.createAccount(params).then((response) =>
      ({ params, response }),
    );

const fetchAccount = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchRelationships([accountId]));

    const account = selectAccount(getState(), accountId);

    if (account) {
      return Promise.resolve(null);
    }

    return getClient(getState()).accounts.getAccount(accountId)
      .then(response => {
        dispatch(importEntities({ accounts: [response] }));
      })
      .catch(error => {
      });
  };

const fetchAccountByUsername = (username: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { auth, me } = getState();
    const features = auth.client.features;

    if (features.accountByUsername && (me || !features.accountLookup)) {
      return getClient(getState()).accounts.getAccount(username).then(response => {
        dispatch(fetchRelationships([response.id]));
        dispatch(importEntities({ accounts: [response] }));
      });
    } else if (features.accountLookup) {
      return dispatch(accountLookup(username)).then(account => {
        dispatch(fetchRelationships([account.id]));
      });
    } else {
      return getClient(getState()).accounts.searchAccounts(username, { resolve: true, limit: 1 }).then(accounts => {
        const found = accounts.find((a) => a.acct === username);

        if (found) {
          dispatch(fetchRelationships([found.id]));
        } else {
          throw accounts;
        }
      });
    }
  };

const fetchRelationships = (accountIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const newAccountIds = accountIds.filter(id => !queryClient.getQueryData(['accountRelationships', id]));

    if (newAccountIds.length === 0) {
      return null;
    }

    const fetcher = batcher.relationships(getClient(getState())).fetch;

    return Promise.all(newAccountIds.map(fetcher))
      .then(response => dispatch(importEntities({ relationships: response })));
  };

const accountLookup = (acct: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).accounts.lookupAccount(acct, { signal }).then((account) => {
      if (account && account.id) dispatch(importEntities({ accounts: [account] }));
      return account;
    });

type AccountsAction = {
    type: typeof ACCOUNT_BLOCK_SUCCESS | typeof ACCOUNT_MUTE_SUCCESS;
    relationship: Relationship;
    statuses: Record<string, MinifiedStatus>;
  };

export {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  createAccount,
  fetchAccount,
  fetchAccountByUsername,
  fetchRelationships,
  accountLookup,
  type AccountsAction,
};
