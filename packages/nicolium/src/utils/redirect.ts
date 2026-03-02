const LOCAL_STORAGE_REDIRECT_KEY = 'nicolium:redirect_uri';

const getRedirectUrl = () => {
  let redirectUri = localStorage.getItem(LOCAL_STORAGE_REDIRECT_KEY);
  if (redirectUri) {
    redirectUri = decodeURIComponent(redirectUri);
  }

  localStorage.removeItem(LOCAL_STORAGE_REDIRECT_KEY);
  return redirectUri ?? '/';
};

export { getRedirectUrl, LOCAL_STORAGE_REDIRECT_KEY };
