/** Returns `true` if the node contains only emojis, up to a limit */
const onlyEmoji = (node: HTMLElement, limit = 1, ignoreMentions = true): boolean => {
  if (!node) return false;

  try {
    // Remove mentions before checking content
    if (ignoreMentions) {
      node = node.cloneNode(true) as HTMLElement;
      node.querySelectorAll('a.mention').forEach((m) => m.parentNode?.removeChild(m));
    }

    if (node.textContent?.replaceAll(new RegExp(' ', 'g'), '') !== '') return false;
    const emojis = Array.from(node.querySelectorAll('img.emojione, span.emojione'));
    if (emojis.length === 0) return false;
    if (emojis.length > limit) return false;
    const images = Array.from(node.querySelectorAll('img'));
    if (images.length > emojis.length) return false;
    return true;
  } catch (e) {
    // If anything in here crashes, skipping it is inconsequential.
    console.error(e);
    return false;
  }
};

/** Returns the hour if the node contains only an hour, optionally with a single emoji */
const onlyHour = (node: HTMLElement, ignoreMentions = true): string | false => {
  if (!node) return false;

  try {
    if (ignoreMentions) {
      node = node.cloneNode(true) as HTMLElement;
      node.querySelectorAll('a.mention').forEach((m) => m.parentNode?.removeChild(m));
    }

    const rawHour = node.textContent
      ?.replace(/^[\s\u2000-\u200f]+|[\s\u2000-\u200f]+$/g, '')
      .match(/^([01]?\d|2[0-3])?:[0-5]\d$/)?.[0];
    if (!rawHour) return false;
    const hour = rawHour?.includes(':') ? rawHour : `${rawHour.slice(0, -2)}:${rawHour.slice(-2)}`;

    const emojis = Array.from(node.querySelectorAll('img.emojione, span.emojione'));
    if (emojis.length > 1) return false;
    const images = Array.from(node.querySelectorAll('img'));
    if (images.length > emojis.length) return false;
    return hour;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export { onlyEmoji, onlyHour };
