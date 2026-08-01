import * as BuildConfig from '@/build-config';
import sourceCode from '@/utils/code';
import { getScopes } from '@/utils/scopes';

import { createApp } from './apps';

const createProviderApp = () => {
  const scopes = getScopes(undefined, true);

  const params = {
    client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
    redirect_uris: `${window.location.origin}/login/external`,
    website: sourceCode.homepage,
    scopes,
  };

  return createApp(params);
};

const prepareRequest = async (provider: string) => {
  const baseURL = URL.canParse(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '';

  const scopes = getScopes(undefined, true);
  const app = await createProviderApp();
  const { client_id, redirect_uri } = app;

  localStorage.setItem('nicolium:external:app', JSON.stringify(app));
  localStorage.setItem('nicolium:external:baseurl', baseURL);
  localStorage.setItem('nicolium:external:scopes', scopes);

  const params: Record<string, string> = {
    provider,
    'authorization[client_id]': client_id,
    'authorization[scope]': scopes,
  };

  if (redirect_uri) params['authorization[redirect_uri]'] = redirect_uri;

  const query = new URLSearchParams(params);

  location.href = `${baseURL}/oauth/prepare_request?${query.toString()}`;
};

export { prepareRequest };
