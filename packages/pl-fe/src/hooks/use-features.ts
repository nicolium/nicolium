import * as plapi from 'pl-api';
import { type Features } from 'pl-api';
import * as v from 'valibot';

import { useAppSelector } from './use-app-selector';

(window as any).v = v;
(window as any).plapi = plapi;

/** Get features for the current instance. */
const useFeatures = (): Features => ({ ...useAppSelector(state => state.auth.client.features), filtersV2BlurAction: true });

export { useFeatures };
