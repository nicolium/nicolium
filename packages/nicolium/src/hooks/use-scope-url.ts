import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { backendUrl } from '@/stores/auth';

const useScopeUrl = () => useCurrentAccountContext().meUrl || backendUrl;

export { useScopeUrl };
