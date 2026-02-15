import { urlRegex } from './url-regex';

const urlPlaceholder = 'xxxxxxxxxxxxxxxxxxxxxxx';

const countableText = (inputText: string) =>
  inputText
    .replace(urlRegex, urlPlaceholder)
    .replace(/(^|[^/\w])@(([a-z0-9_]+)@[a-z0-9.-]+[a-z0-9]+)/gi, '$1@$3');

export { countableText };
