import { createSelector } from 'reselect';

import { getAccounts, selectAccount, selectAccounts } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useSettingsStore } from '@/stores/settings';
import { getDomain } from '@/utils/accounts';
import ConfigDB from '@/utils/config-db';
import { shouldFilter } from '@/utils/timelines';

import type { minifyAdminReport } from '@/queries/utils/minify-list';
import type { NormalizedStatus } from '@/reducers/statuses';
import type { MRFSimple } from '@/schemas/pleroma';
import type { RootState } from '@/store';
import type { Account, Filter, FilterResult, NotificationGroup } from 'pl-api';

const toServerSideType = (columnType: string): Filter['context'][0] => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.includes('list:')) {
        return 'home';
      }
      return 'public'; // community, account, hashtag
  }
};

type FilterContext = { contextType?: string };

const getFilters = (state: Pick<RootState, 'filters'>, query: FilterContext) =>
  state.filters.filter(
    (filter) =>
      (!query?.contextType || filter.context.includes(toServerSideType(query.contextType))) &&
      (filter.expires_at === null || Date.parse(filter.expires_at) > Date.now()),
  );

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

const checkFiltered = (index: string, filters: Array<Filter>) =>
  filters.reduce(
    (result: Array<FilterResult>, filter) =>
      result.concat(
        filter.keywords.reduce((result: Array<FilterResult>, keyword) => {
          let expr = escapeRegExp(keyword.keyword);

          if (keyword.whole_word) {
            if (/^[\w]/.test(expr)) {
              expr = `\\b${expr}`;
            }

            if (/[\w]$/.test(expr)) {
              expr = `${expr}\\b`;
            }
          }

          const regex = new RegExp(expr);

          if (regex.test(index))
            return result.concat({ filter, keyword_matches: null, status_matches: null });
          return result;
        }, []),
      ),
    [],
  );

type APIStatus = { id: string; username?: string };

const makeGetStatus = () =>
  createSelector(
    [
      (state: RootState, { id }: APIStatus) => state.statuses[id],
      (state: RootState, { id }: APIStatus) =>
        state.statuses[state.statuses[id]?.reblog_id ?? ''] || null,
      (state: RootState, { id }: APIStatus) =>
        state.statuses[state.statuses[id]?.quote_id ?? ''] || null,
      (_state: RootState, { username }: APIStatus) => username,
      (state: RootState) => state.filters,
      (_state: RootState, { contextType }: FilterContext) => contextType,
      (state: RootState) => state.me,
      (state: RootState) => state.auth.client.features,
    ],

    (statusBase, statusReblog, statusQuote, username, filters, contextType, me, features) => {
      if (!statusBase) return null;
      const account = queryClient.getQueryData(queryKeys.accounts.show(statusBase.account_id))!;
      const accountUsername = account.acct;

      // Must be owner of status if username exists.
      if (accountUsername !== username && username !== undefined) {
        return null;
      }

      filters = getFilters({ filters }, { contextType });

      const filtered = features.filtersV2
        ? statusBase.filtered
        : (features.filters &&
            account.id !== me &&
            checkFiltered(statusReblog?.search_index || statusBase.search_index || '', filters)) ||
          [];

      return {
        ...statusBase,
        account,
        reblog: statusReblog || null,
        quote: statusQuote || null,
        filtered,
      };
    },
  );

type SelectedStatus = Exclude<ReturnType<ReturnType<typeof makeGetStatus>>, null>;

const makeGetNotification = () =>
  createSelector(
    [
      (_state: RootState, notification: NotificationGroup) => notification,
      (_state: RootState, notification: NotificationGroup) =>
        // @ts-expect-error types will be fine valibot ensures that
        selectAccount(notification.target_id),
      // @ts-expect-error types will be fine valibot ensures that
      (state: RootState, notification: NotificationGroup) => state.statuses[notification.status_id],
      (_state: RootState, notification: NotificationGroup) =>
        selectAccounts(notification.sample_account_ids),
    ],
    (notification, target, status, accounts): SelectedNotification => ({
      ...notification,
      // @ts-expect-error types will be fine valibot ensures that
      target,
      // @ts-expect-error types will be fine valibot ensures that
      status,
      accounts,
    }),
  );

type SelectedNotification = NotificationGroup & {
  accounts: Array<Account>;
} & (
    | {
        type: 'follow' | 'follow_request' | 'admin.sign_up' | 'bite';
      }
    | {
        type:
          | 'status'
          | 'mention'
          | 'reblog'
          | 'favourite'
          | 'poll'
          | 'update'
          | 'emoji_reaction'
          | 'event_reminder'
          | 'participation_accepted'
          | 'participation_request'
          | 'quote'
          | 'quoted_update';
        status: NormalizedStatus;
      }
    | {
        type: 'move';
        target: Account;
      }
  );

const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (_state: RootState, report?: ReturnType<typeof minifyAdminReport>) => report,
      (state: RootState, report?: ReturnType<typeof minifyAdminReport>) =>
        report?.status_ids
          .map((statusId) => getStatus(state, { id: statusId }))
          .filter((status): status is SelectedStatus => status !== null),
    ],
    (report, statuses = []) => {
      if (!report) return null;

      const account = selectAccount(report.account_id ?? '');
      const target_account = selectAccount(report.target_account_id ?? '');
      const assigned_account = selectAccount(report.assigned_account_id ?? '');

      return {
        ...report,
        account,
        target_account,
        assigned_account,
        statuses,
      };
    },
  );
};

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
      (state: RootState) => state.statuses,
    ],
    (columnSettings: any, statusIds: Array<string>, statuses) =>
      statusIds.filter((id: string) => {
        const status = statuses[id];
        if (!status) return true;
        return !shouldFilter(status, columnSettings);
      }),
  );

export {
  type RemoteInstance,
  getFilters,
  regexFromFilters,
  makeGetStatus,
  type SelectedStatus,
  makeGetNotification,
  makeGetReport,
  makeGetHosts,
  makeGetRemoteInstance,
  makeGetStatusIds,
};
