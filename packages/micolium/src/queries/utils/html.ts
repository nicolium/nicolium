import { textContent } from 'domutils';
import { parseDocument } from 'htmlparser2';

const unescapeHTML = (html: string = ''): string =>
  textContent(parseDocument(html.replaceAll(/<br\s*\/?>/gi, '\n').replaceAll(/<\/p>/gi, '\n\n')));

export { unescapeHTML };
