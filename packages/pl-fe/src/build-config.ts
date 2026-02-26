/**
 * Build config: configuration set at build time.
 * @module pl-fe/build-config
 */

const env = compileTime(() => {
  const { NODE_ENV, BACKEND_URL, FE_SUBDIRECTORY, WITH_LANDING_PAGE, BANNER_HTML } = process.env;

  const sanitizeURL = (url: string | undefined = ''): string => {
    try {
      return new URL(url).toString().replace(/\/+$/, '');
    } catch {
      return '';
    }
  };

  const sanitizeBasename = (path: string | undefined = ''): string =>
    `/${path.replaceAll(/^\/+|\/+$/g, '')}`;

  return {
    NODE_ENV: NODE_ENV ?? 'development',
    BACKEND_URL: sanitizeURL(BACKEND_URL),
    FE_SUBDIRECTORY: sanitizeBasename(FE_SUBDIRECTORY),
    WITH_LANDING_PAGE: WITH_LANDING_PAGE === 'true',
    BANNER_HTML,
  };
});

const { NODE_ENV, BACKEND_URL, FE_SUBDIRECTORY, WITH_LANDING_PAGE, BANNER_HTML } = env;

export type FrontendEnv = typeof env;

export { NODE_ENV, BACKEND_URL, FE_SUBDIRECTORY, WITH_LANDING_PAGE, BANNER_HTML };
