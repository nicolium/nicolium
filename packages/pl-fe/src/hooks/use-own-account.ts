import { useAccount } from '@/api/hooks/accounts/use-account';

import { useLoggedIn } from './use-logged-in';

/** Get the logged-in account from the store, if any. */
const useOwnAccount = () => {
  const { me } = useLoggedIn();

  return useAccount(typeof me === 'string' ? me : undefined);
};

export {
  useOwnAccount,
};
