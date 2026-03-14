import { useAuthStore } from '@/stores/auth';

const useClient = () => useAuthStore((state) => state.client);

export { useClient };
