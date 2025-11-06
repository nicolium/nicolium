// Converts cryptocurrency-icon's manifest file from a list to a map.
// See: https://github.com/spothq/cryptocurrency-icons/blob/master/manifest.json

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const manifest = require('cryptocurrency-icons/manifest.json');

const manifestMap = manifest.reduce((acc: Record<string, typeof manifest[0]>, entry: typeof manifest[0]) => {
  acc[entry.symbol.toLowerCase()] = entry;
  return acc;
}, {});

export default () => ({
  data: manifestMap,
});
