import { Features } from 'pl-api';

import { useAppSelector } from './use-app-selector';

/** Get features for the current instance. */
const useFeatures = (): Features => useAppSelector(state => state.auth.client.features);

export { useFeatures };
