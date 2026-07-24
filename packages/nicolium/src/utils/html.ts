/** Convert HTML to a plaintext representation, preserving whitespace. */
const unescapeHTML = (html: string = ''): string => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  document.querySelectorAll('p').forEach((p) => p.append('\n\n'));
  return document.body.textContent || '';
};

/** Convert HTML to plaintext. */
// https://stackoverflow.com/a/822486
const stripHTML = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export { unescapeHTML, stripHTML };
