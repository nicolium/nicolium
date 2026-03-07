import { getClient } from '@/api';

import type { AppDispatch, RootState } from '@/store';
import type { CreateAccountParams } from 'pl-api';

const createAccount =
  (params: CreateAccountParams) => (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState())
      .settings.createAccount(params)
      .then((response) => ({ params, response }));

export { createAccount };
