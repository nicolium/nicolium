import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminReport, minifyAdminReportList } from '../utils/minify-list';

import type { AdminGetReportsParams, PaginationParams } from 'pl-api';

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
  ['admin', 'reportLists', { resolved: false }],
  (client) => client.admin.reports.getReports({ resolved: false }).then(minifyAdminReportList),
)();

const usePendingReportsCount = () => {
  const { account } = useOwnAccount();

  return useInfiniteQuery({
    ...pendingReportsQuery,
    select: (data) => data.pages.at(-1)?.total || data.pages.map(page => page.items).flat().length || 0,
    enabled: account?.is_admin || account?.is_moderator,
  });
};

const useResolveReport = (reportId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'reports', reportId],
    mutationFn: (actionTakenComment?: string) => client.admin.reports.resolveReport(reportId, actionTakenComment),
    onSuccess: (report) => {
      queryClient.setQueryData(['admin', 'reports', reportId], minifyAdminReport(report));
      queryClient.setQueriesData({
        queryKey: ['admin', 'reportLists', {
          resolved: false,
        }],
        exact: false,
      }, filterById(reportId));
      queryClient.invalidateQueries({
        queryKey: ['admin', 'reportLists', {
          resolved: true,
        }],
        exact: false,
      });
    },
  });
};

export { useReports, useReport, pendingReportsQuery, usePendingReportsCount, useResolveReport };
