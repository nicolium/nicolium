import { useCurrentAccount } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';

/** Get the logged-in account from the store, if any. */
const useOwnAccount = () => {
  const me = useCurrentAccount();

  return useAccount(typeof me === 'string' ? me : undefined);
};

export { useOwnAccount };
