import { getClient } from '@/api';

import type { NormalizedStatus } from '@/reducers/statuses';
import type { AppDispatch, RootState } from '@/store';
import type { CreateAccountParams, Relationship } from 'pl-api';

const ACCOUNT_BLOCK_SUCCESS = 'ACCOUNT_BLOCK_SUCCESS' as const;
const ACCOUNT_MUTE_SUCCESS = 'ACCOUNT_MUTE_SUCCESS' as const;

const createAccount =
  (params: CreateAccountParams) => (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState())
      .settings.createAccount(params)
      .then((response) => ({ params, response }));

type AccountsAction = {
  type: typeof ACCOUNT_BLOCK_SUCCESS | typeof ACCOUNT_MUTE_SUCCESS;
  relationship: Relationship;
  statuses: Record<string, NormalizedStatus>;
};

export { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS, createAccount, type AccountsAction };
