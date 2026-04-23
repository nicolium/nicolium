import { useClient } from '@/hooks/use-client';

import type { Features } from 'pl-api';

/** Get features for the current instance. */
const useFeatures = (): Features => ({
  ...useClient().features,
  filtersV2BlurAction: true,
});

export { useFeatures };
