import { mrfSimpleSchema, type MRFSimple } from '@/schemas/pleroma';
import ConfigDB from '@/utils/config-db';

import type { PleromaConfig } from 'pl-api';

const simplePolicyMerge = (
  simplePolicy: Partial<MRFSimple>,
  host: string,
  restrictions: Record<string, any>,
): MRFSimple => {
  const entries = Object.entries(simplePolicy).map(([key, hosts]) => {
    const isRestricted = restrictions[key];

    hosts = [...hosts];

    if (isRestricted) {
      if (!hosts.some((tuple) => tuple[0] === host)) {
        hosts.push([host, '']);
      }
    } else {
      hosts = hosts.filter((tuple) => tuple[0] !== host);
    }

    return [key, hosts];
  });

  return Object.fromEntries([
    ...Object.keys(mrfSimpleSchema.wrapped.pipe[2].entries).map((key) => [key, []]),
    ...entries,
  ]);
};

const getUpdatedMrf = (
  configs: PleromaConfig['configs'],
  host: string,
  restrictions: Record<string, any>,
) => {
  const simplePolicy = ConfigDB.toSimplePolicy(configs);
  const merged = simplePolicyMerge(simplePolicy, host, restrictions);
  const config = ConfigDB.fromSimplePolicy(merged);
  return config;
};

export { getUpdatedMrf };
