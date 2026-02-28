// Adapted from Sharkey, licensed under AGPL-3.0-only
// https://activitypub.software/TransFem-org/Sharkey/-/blob/develop/packages/misskey-js/src/nyaize.ts

const koRegex1 = /[나-낳]/g;
const koRegex2 = /(다$)|(다(?=\.))|(다(?= ))|(다(?=!))|(다(?=\?))/gm;
const koRegex3 = /(야(?=\?))|(야$)|(야(?= ))/gm;

const ifAfter = (prefix: string, fn: (x: string) => string) => {
  const preLen = prefix.length;
  const regex = new RegExp(prefix, 'i');
  return (x: string, pos: number, string: string) => {
    return pos > 0 && string.slice(pos - preLen, pos).match(regex) ? fn(x) : x;
  };
};

const nyaize = (text: string) =>
  text
    // ja-JP
    .replaceAll('な', 'にゃ')
    .replaceAll('ナ', 'ニャ')
    .replaceAll('ﾅ', 'ﾆｬ')
    // en-US
    .replace(
      /a/gi,
      ifAfter('n', (x) => (x === 'A' ? 'YA' : 'ya')),
    )
    .replace(
      /ing/gi,
      ifAfter('morn', (x) => (x === 'ING' ? 'YAN' : 'yan')),
    )
    .replace(
      /one/gi,
      ifAfter('every', (x) => (x === 'ONE' ? 'NYAN' : 'nyan')),
    )
    // pl-PL
    .replace(
      /ł/gi,
      ifAfter('mia', (x) => (x === 'Ł' ? 'U' : 'u')),
    )
    // ru-RU
    .replace(
      /а/gi,
      ifAfter('н', (x) => (x === 'А' ? 'Я' : 'я')),
    )
    // ko-KR
    .replace(koRegex1, (match) =>
      !isNaN(match.charCodeAt(0))
        ? String.fromCharCode(match.charCodeAt(0) + '냐'.charCodeAt(0) - '나'.charCodeAt(0))
        : match,
    )
    .replace(koRegex2, '다냥')
    .replace(koRegex3, '냥');

export default nyaize;
