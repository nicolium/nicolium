import { mrfSimpleSchema, type MRFSimple } from '@/schemas/pleroma';
import ConfigDB from '@/utils/config-db';

import { fetchConfig, updateConfig } from './admin';

import type { AppDispatch, RootState } from '@/store';

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
    ...Object.keys(
      (mrfSimpleSchema as any).wrapped.pipe[2].entries as typeof mrfSimpleSchema.entries,
    ).map((key) => [key, []]),
    ...entries,
  ]);
};

const updateMrf =
  (host: string, restrictions: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    dispatch(fetchConfig()).then(() => {
      const configs = getState().admin.configs;
      const simplePolicy = ConfigDB.toSimplePolicy(configs);
      const merged = simplePolicyMerge(simplePolicy, host, restrictions);
      const config = ConfigDB.fromSimplePolicy(merged);
      return dispatch(updateConfig(config));
    });

export { updateMrf };
