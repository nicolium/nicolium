import { useFrontendConfigStore } from '@/stores/frontend-config';

/** Get the Nicolium config from the store. */
const useFrontendConfig = () => useFrontendConfigStore((state) => state.config);

export { useFrontendConfig };
