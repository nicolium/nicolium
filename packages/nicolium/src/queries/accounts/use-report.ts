import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import type { ReportAccountParams } from 'pl-api';

const useReportAccountMutation = (accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationFn: (params: ReportAccountParams) => client.accounts.reportAccount(accountId, params),
  });
};

export { useReportAccountMutation };
