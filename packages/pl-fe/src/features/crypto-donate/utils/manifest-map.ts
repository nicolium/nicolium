interface ManifestMap {
  [s: string]: {
    symbol: string;
    name: string;
    color: string;
  };
}

export default import.meta.compileTime<ManifestMap>('./manifest-map-compiletime.ts');

export type { ManifestMap };
