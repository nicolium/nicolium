import { getFrontendConfig } from '@/actions/frontend-config';

import { useAppSelector } from './use-app-selector';

/** Get the pl-fe config from the store */
const useFrontendConfig = () => useAppSelector((state) => getFrontendConfig(state));

export { useFrontendConfig };
