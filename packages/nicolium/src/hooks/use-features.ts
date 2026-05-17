import { useClient } from '@/hooks/use-client';

import type { Features } from 'pl-api';

/** Get features for the current instance. */
const useFeatures = (): Features => useClient().features;

export { useFeatures };
