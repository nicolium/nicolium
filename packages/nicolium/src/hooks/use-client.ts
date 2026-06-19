import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { useAuthStore } from '@/stores/auth';

const useClient = () => {
  const url = useCurrentAccountContext().meUrl;
  return useAuthStore((state) => {
    const { clients, defaultClient } = state;
    if (url && clients[url]) return clients[url];
    return defaultClient;
  });
};

export { useClient };
