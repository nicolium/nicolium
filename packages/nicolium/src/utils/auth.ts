const validId = (id?: string | null | false) =>
  typeof id === 'string' && id !== 'null' && id !== 'undefined';

const isURL = (url?: string | null) => {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const parseBaseURL = (url?: string) => {
  if (typeof url !== 'string') return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

export { validId, isURL, parseBaseURL };
