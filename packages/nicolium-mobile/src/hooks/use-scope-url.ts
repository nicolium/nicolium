import { useAuthStore } from '@/stores/auth';

const useScopeUrl = () =>
  useAuthStore(
    (state) => (state.currentAccount && state.sessions[state.currentAccount].instance) || '',
  );

export { useScopeUrl };
