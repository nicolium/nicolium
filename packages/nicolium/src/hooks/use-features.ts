import { useAuthStore } from '@/stores/auth';

import type { Features } from 'pl-api';

/** Get features for the current instance. */
const useFeatures = (): Features => ({
  ...useAuthStore((state) => state.client.features),
  filtersV2BlurAction: true,
});

export { useFeatures };
