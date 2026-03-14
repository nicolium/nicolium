import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';
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
  (client, [params]) => client.admin.reports.getReports(params).then(minifyAdminReportList),
  undefined,
  'isAdmin',
);

const useMinimalReport = (reportId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.admin.reports.show(reportId),
    queryFn: () => client.admin.reports.getReport(reportId).then(minifyAdminReport),
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
  (client) => client.admin.reports.getReports({ resolved: undefined }).then(minifyAdminReportList),
)();

const usePendingReportsCount = () => {
  const { data: account } = useOwnAccount();
  const fetched = useInstanceStore((state) => state.fetched);

  return useInfiniteQuery({
    ...pendingReportsQuery,
    select: (data) =>
      (data.pages.at(-1)?.total ?? data.pages.flatMap((page) => page.items).length) || 0,
    enabled: fetched && !!(account?.is_admin ?? account?.is_moderator),
  });
};

const useUpdateReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: (params: AdminUpdateReportParams) =>
      client.admin.reports.updateReport(reportId, params),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.admin.reports.show(reportId), minifyAdminReport(report));
    },
  });
};

const useSelfAssignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.assignReportToSelf(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.admin.reports.show(reportId), minifyAdminReport(report));
    },
  });
};

const useUnassignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.unassignReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.admin.reports.show(reportId), minifyAdminReport(report));
    },
  });
};

const useResolveReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: (actionTakenComment?: string) =>
      client.admin.reports.resolveReport(reportId, actionTakenComment),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.admin.reports.show(reportId), minifyAdminReport(report));
      queryClient.setQueriesData(
        {
          queryKey: queryKeys.admin.reportLists.show({ resolved: undefined }),
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reportLists.show({ resolved: true }),
        exact: false,
      });
    },
  });
};

const useReopenReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.admin.reports.show(reportId),
    mutationFn: () => client.admin.reports.reopenReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.admin.reports.show(reportId), minifyAdminReport(report));
      queryClient.setQueriesData(
        {
          queryKey: queryKeys.admin.reportLists.show({ resolved: true }),
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reportLists.root,
        exact: false,
      });
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
};
