import { getClient } from '@/api';

import { useAppSelector } from './use-app-selector';

const useClient = () => useAppSelector(getClient);

export { useClient };
