import { getClient } from '@/api';

import type { CreateAccountParams } from 'pl-api';

const createAccount = (params: CreateAccountParams) =>
  getClient()
    .settings.createAccount(params)
    .then((response) => ({ params, response }));

export { createAccount };
