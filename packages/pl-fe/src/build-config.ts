import type { PlFeEnv } from './build-config-compiletime';

export const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  WITH_LANDING_PAGE,
} = import.meta.compileTime<PlFeEnv>('./build-config-compiletime.ts');
