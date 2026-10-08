import { useCurrentAccount } from '@/contexts/current-account-context';

const useScopeUrl = () => useCurrentAccount();

export { useScopeUrl };
