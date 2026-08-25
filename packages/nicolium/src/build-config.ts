/**
 * Build config: configuration set at build time.
 * @module @/build-config
 */
import sourceCode from '@/utils/code';

const TRUTHISH = ['1', 'true', 'yes', 'on'];
const FALSEISH = ['0', 'false', 'no', 'off'];

const env = compileTime(() => {
  const {
    NODE_ENV,
    BACKEND_URL,
    FE_SUBDIRECTORY,
    WITH_LANDING_PAGE,
    BANNER_HTML,
    KINKY,
    CLIENT_NAME,
  } = process.env;

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
    WITH_LANDING_PAGE: TRUTHISH.includes(WITH_LANDING_PAGE?.toLowerCase() ?? ''),
    BANNER_HTML,
    KINKY: !FALSEISH.includes(KINKY?.toLowerCase() ?? ''),
    CLIENT_NAME: CLIENT_NAME ?? `${sourceCode.displayName} (${new URL(window.origin).host})`,
  };
});

const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  WITH_LANDING_PAGE,
  BANNER_HTML,
  KINKY,
  CLIENT_NAME,
} = env;

export {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  WITH_LANDING_PAGE,
  BANNER_HTML,
  KINKY,
  CLIENT_NAME,
};
