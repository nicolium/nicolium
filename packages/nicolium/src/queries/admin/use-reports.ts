import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppInfiniteQuery, useAppQuery } from '@/queries/query';
import { useInstanceStore } from '@/stores/instance';

import { useAccount } from '../accounts/use-account';
import { queryKeys } from '../keys';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminReport, minifyAdminReportList } from '../utils/minify-list';

import type { AdminGetReportsParams, AdminUpdateReportParams, PaginationParams } from 'pl-api';

const useReports = makePaginatedResponseQuery(
  (params: Omit<AdminGetReportsParams, keyof PaginationParams>) =>
    queryKeys.admin.reportLists.show(params),
  (client, [params], scopeUrl) =>
    client.admin.reports
      .getReports(params)
      .then((response) => minifyAdminReportList(response, scopeUrl)),
  undefined,
  'isAdmin',
);

const useMinimalReport = (reportId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.admin.reports.show(reportId),
    queryFn: () =>
      client.admin.reports
        .getReport(reportId)
        .then((report) => minifyAdminReport(report, scopeUrl)),
  });
};

const useReport = (reportId: string) => {
  const reportQuery = useMinimalReport(reportId);

  // const statuses = useStatuses();
  const { data: account } = useAccount(reportQuery.data?.account_id ?? undefined);
  const { data: targetAccount } = useAccount(reportQuery.data?.target_account_id ?? undefined);
  const { data: assignedAccount } = useAccount(reportQuery.data?.assigned_account_id ?? undefined);

  return useMemo(() => {
    if (!reportQuery.data) return reportQuery;

    return {
      ...reportQuery,
      data: {
        ...reportQuery.data,
        account,
        target_account: targetAccount,
        assigned_account: assignedAccount,
      },
    };
  }, [reportQuery.data, account, targetAccount, assignedAccount]);
};

const pendingReportsQuery = makePaginatedResponseQueryOptions(
  queryKeys.admin.reportLists.show({ resolved: undefined }),
  (client, _params, scopeUrl) =>
    client.admin.reports
      .getReports({ unresolved: true })
      .then((response) => minifyAdminReportList(response, scopeUrl)),
);

const usePendingReportsCount = () => {
  const client = useClient();
  const { data: account } = useOwnAccount();
  const fetched = useInstanceStore((state) => state.fetched);
  const scopeUrl = useScopeUrl();

  return useAppInfiniteQuery({
    ...pendingReportsQuery(client, scopeUrl),
    select: (data) =>
      (data.pages.at(-1)?.total ?? data.pages.flatMap((page) => page.items).length) || 0,
    enabled: fetched && !!(account?.is_admin ?? account?.is_moderator),
  });
};

const useUpdateReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: (params: AdminUpdateReportParams) =>
      client.admin.reports.updateReport(reportId, params),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
    },
  });
};

const useSelfAssignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.assignReportToSelf(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
    },
  });
};

const useUnassignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.unassignReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
    },
  });
};

const useResolveReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: (actionTakenComment?: string) =>
      client.admin.reports.resolveReport(reportId, actionTakenComment),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
      queryClient.setQueriesData(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.reportLists.show({ resolved: undefined }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.reportLists.show({ resolved: true }), scopeUrl),
        exact: false,
      });
    },
  });
};

const useReopenReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.reopenReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
      queryClient.setQueriesData(
        {
          queryKey: scopedQueryKey(queryKeys.admin.reportLists.show({ resolved: true }), scopeUrl),
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.reportLists.root, scopeUrl),
        exact: false,
      });
    },
  });
};

const useForwardReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.forwardReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.reports.show(reportId), scopeUrl),
        minifyAdminReport(report, scopeUrl),
      );
    },
  });
};

export {
  useReports,
  useReport,
  usePendingReportsCount,
  useUpdateReport,
  useSelfAssignReport,
  useUnassignReport,
  useResolveReport,
  useReopenReport,
  useForwardReport,
};
