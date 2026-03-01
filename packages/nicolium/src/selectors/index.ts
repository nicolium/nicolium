import { createSelector } from 'reselect';

import { getAccounts } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useSettingsStore } from '@/stores/settings';
import { getDomain } from '@/utils/accounts';
import ConfigDB from '@/utils/config-db';
import { shouldFilter } from '@/utils/timelines';

import type { MRFSimple } from '@/schemas/pleroma';
import type { RootState } from '@/store';
import type { Filter } from 'pl-api';

const escapeRegExp = (string: string) => string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

const regexFromFilters = (filters: Array<Filter>) => {
  if (filters.length === 0) return null;

  return new RegExp(
    filters
      .map((filter) =>
        filter.keywords
          .map((keyword) => {
            let expr = escapeRegExp(keyword.keyword);

            if (keyword.whole_word) {
              if (/^[\w]/.test(expr)) {
                expr = `\\b${expr}`;
              }

              if (/[\w]$/.test(expr)) {
                expr = `${expr}\\b`;
              }
            }

            return expr;
          })
          .join('|'),
      )
      .join('|'),
    'i',
  );
};

// const checkFiltered = (index: string, filters: Array<Filter>) =>
//   filters.reduce(
//     (result: Array<FilterResult>, filter) =>
//       result.concat(
//         filter.keywords.reduce((result: Array<FilterResult>, keyword) => {
//           let expr = escapeRegExp(keyword.keyword);

//           if (keyword.whole_word) {
//             if (/^[\w]/.test(expr)) {
//               expr = `\\b${expr}`;
//             }

//             if (/[\w]$/.test(expr)) {
//               expr = `${expr}\\b`;
//             }
//           }

//           const regex = new RegExp(expr);

//           if (regex.test(index))
//             return result.concat({ filter, keyword_matches: null, status_matches: null });
//           return result;
//         }, []),
//       ),
//     [],
//   );

const getSimplePolicy = createSelector(
  [
    (state: RootState) => state.admin.configs,
    (state: RootState) => state.instance.pleroma.metadata.federation.mrf_simple_info,
  ],
  (configs, instancePolicy): MRFSimple => ({
    ...instancePolicy,
    ...ConfigDB.toSimplePolicy(configs),
  }),
);

const getRemoteInstanceFavicon = (_state: RootState, host: string) => {
  const account = getAccounts().find((item) => item && getDomain(item) === host);
  return account?.favicon ?? null;
};

type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

const getRemoteInstanceFederation = (state: RootState, host: string): HostFederation => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [
      key,
      hosts.some((entry) => entry[0] === host),
    ]),
  ) as HostFederation;
};

const makeGetHosts = () =>
  createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return [
      ...new Set(Object.values(rest).reduce((acc, hosts) => (acc.push(...hosts), acc), [])),
    ].toSorted();
  });

interface RemoteInstance {
  host: string;
  favicon: string | null;
  federation: HostFederation;
}

const makeGetRemoteInstance = () =>
  createSelector(
    [
      (_state: RootState, host: string) => host,
      getRemoteInstanceFavicon,
      getRemoteInstanceFederation,
    ],
    (host, favicon, federation): RemoteInstance => ({
      host,
      favicon,
      federation,
    }),
  );

type ColumnQuery = { type: string; prefix?: string };

const makeGetStatusIds = () =>
  createSelector(
    [
      (_state: RootState, { type, prefix }: ColumnQuery) =>
        useSettingsStore.getState().settings.timelines[prefix ?? type],
      (state: RootState, { type }: ColumnQuery) => state.timelines[type]?.items || [],
    ],
    (columnSettings, statusIds: Array<string>) =>
      statusIds.filter((id: string) => {
        const status = queryClient.getQueryData(queryKeys.statuses.show(id));
        if (!status) return true;
        return !shouldFilter(status, columnSettings);
      }),
  );

export {
  type RemoteInstance,
  regexFromFilters,
  makeGetHosts,
  makeGetRemoteInstance,
  makeGetStatusIds,
};
