import { createRequire } from 'node:module';

interface ManifestMap {
  [s: string]: {
    symbol: string;
    name: string;
    color: string;
  };
}

const manifestMap = compileTime(() => {
  const require = createRequire(import.meta.url);
  const manifest = require('cryptocurrency-icons/manifest.json');

  const manifestMap = manifest.reduce((acc: Record<string, typeof manifest[0]>, entry: typeof manifest[0]) => {
    acc[entry.symbol.toLowerCase()] = entry;
    return acc;
  }, {});

  return manifestMap;
});

export default manifestMap;

export type { ManifestMap };
