/** Capitalize the first letter of a string. */
// https://stackoverflow.com/a/1026087
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const incrementId = (str: string): string => {
  const CHARS = str.match(/[a-z]/i)
    ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    : '0123456789';
  const chars = [...str];
  for (let i = chars.length - 1; i >= 0; i--) {
    const idx = CHARS.indexOf(chars[i]);
    if (idx === -1) continue;
    if (idx < CHARS.length - 1) {
      chars[i] = CHARS[idx + 1];
      return chars.join('');
    }
    chars[i] = CHARS[0];
  }
  return CHARS[1] + chars.join('');
};

export { capitalize, incrementId };
