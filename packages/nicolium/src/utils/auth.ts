const validId = (id?: string | null | false) =>
  typeof id === 'string' && id !== 'null' && id !== 'undefined';

const parseBaseURL = (url?: string) => {
  if (!url || !URL.canParse(url)) return '';
  return new URL(url).origin;
};

export { validId, parseBaseURL };
