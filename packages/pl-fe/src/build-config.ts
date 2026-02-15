/**
 * Build config: configuration set at build time.
 * @module pl-fe/build-config
 */

const env = compileTime(() => {
  const {
    NODE_ENV,
    BACKEND_URL,
    FE_SUBDIRECTORY,
    WITH_LANDING_PAGE,
  } = process.env;

  const sanitizeURL = (url: string | undefined = ''): string => {
    try {
      return new URL(url).toString().replace(/\/+$/, '');
    } catch {
      return '';
    }
  };

  const sanitizeBasename = (path: string | undefined = ''): string => `/${path.replace(/^\/+|\/+$/g, '')}`;

  return {
    NODE_ENV: NODE_ENV ?? 'development',
    BACKEND_URL: sanitizeURL(BACKEND_URL),
    FE_SUBDIRECTORY: sanitizeBasename(FE_SUBDIRECTORY),
    WITH_LANDING_PAGE: WITH_LANDING_PAGE === 'true',
  };
});

const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  WITH_LANDING_PAGE,
} = env;

export type PlFeEnv = typeof env;

export {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  WITH_LANDING_PAGE,
};
