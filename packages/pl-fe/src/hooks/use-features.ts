import { useAppSelector } from './use-app-selector';

import type { Features } from 'pl-api';

/** Get features for the current instance. */
const useFeatures = (): Features => ({
  ...useAppSelector((state) => state.auth.client.features),
  filtersV2BlurAction: true,
});

export { useFeatures };
