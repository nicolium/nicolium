import { useCurrentAccountContext } from '@/contexts/current-account-context';

const useClient = () => useCurrentAccountContext().client;

export { useClient };
