import { useMemo } from 'react';
import * as v from 'valibot';

import { frontendConfigSchema } from '@/schemas/frontend-config';

import { useAppSelector } from './use-app-selector';

const defaultFrontendConfig = v.parse(frontendConfigSchema, {});

/** Get the Nicolium config from the store */
const useFrontendConfig = () => {
  const partialConfig = useAppSelector((state) => state.frontendConfig);

  return useMemo(() => ({ ...defaultFrontendConfig, ...partialConfig }), [partialConfig]);
};

export { useFrontendConfig };
