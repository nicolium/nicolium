import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useInstance } from '@/hooks/use-instance';
import { useOwnAccount } from '@/hooks/use-own-account';

import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminReport, minifyAdminReportList } from '../utils/minify-list';

import type { AdminGetReportsParams, AdminUpdateReportParams, PaginationParams } from 'pl-api';

const useReports = makePaginatedResponseQuery(
  (params: Omit<AdminGetReportsParams, keyof PaginationParams>) => ['admin', 'reportLists', params],
  (client, [params]) => client.admin.reports.getReports(params).then(minifyAdminReportList),
  undefined,
  'isAdmin',
);

const useReport = (reportId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['admin', 'reports', reportId],
    queryFn: () => client.admin.reports.getReport(reportId).then(minifyAdminReport),
  });
};

const pendingReportsQuery = makePaginatedResponseQueryOptions(
  ['admin', 'reportLists', { resolved: undefined }],
  (client) => client.admin.reports.getReports({ resolved: undefined }).then(minifyAdminReportList),
)();

const usePendingReportsCount = () => {
  const { data: account } = useOwnAccount();
  const instance = useInstance();

  return useInfiniteQuery({
    ...pendingReportsQuery,
    select: (data) =>
      (data.pages.at(-1)?.total ?? data.pages.map((page) => page.items).flat().length) || 0,
    enabled: !!instance.fetched && !!(account?.is_admin ?? account?.is_moderator),
  });
};

const useUpdateReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: (params: AdminUpdateReportParams) =>
      client.admin.reports.updateReport(reportId, params),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
    },
  });
};

const useSelfAssignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: () => client.admin.reports.assignReportToSelf(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
    },
  });
};

const useUnassignReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: () => client.admin.reports.unassignReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
    },
  });
};

const useResolveReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: (actionTakenComment?: string) =>
      client.admin.reports.resolveReport(reportId, actionTakenComment),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
      queryClient.setQueriesData(
        {
          queryKey: [
            'admin',
            'reportLists',
            {
              resolved: undefined,
            },
          ],
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'reportLists',
          {
            resolved: true,
          },
        ],
        exact: false,
      });
    },
  });
};

const useReopenReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: () => client.admin.reports.reopenReport(reportId),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
      queryClient.setQueriesData(
        {
          queryKey: [
            'admin',
            'reportLists',
            {
              resolved: true,
            },
          ],
          exact: false,
        },
        filterById(reportId),
      );
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'reportLists',
          {
            resolved: undefined,
          },
        ],
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
