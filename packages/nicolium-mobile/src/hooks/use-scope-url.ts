import { useAuthStore } from '@/stores/auth';

const useScopeUrl = () => useAuthStore().instance || '';

export { useScopeUrl };
