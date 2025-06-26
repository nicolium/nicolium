import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

const useAccountAliases = () => {
  const client = useClient();
  const features = useFeatures();
  const { account } = useOwnAccount();

  return useQuery({
    queryKey: ['settings', 'accountAliases'],
    queryFn: async (): Promise<Array<string>> => {
      if (features.accountMoving) return (await client.settings.getAccountAliases()).aliases;
      return account?.__meta.pleroma?.also_known_as ?? [];
    },
  });
};

const useAddAccountAlias = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'accountAliases'],
    mutationFn: (acct: string) => client.settings.addAccountAlias(acct),
    onSettled: () => queryClient.invalidateQueries({
      queryKey: ['settings', 'accountAliases'],
    }),
  });
};

const useDeleteAccountAlias = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'accountAliases'],
    mutationFn: (acct: string) => client.settings.deleteAccountAlias(acct),
    onSettled: () => queryClient.invalidateQueries({
      queryKey: ['settings', 'accountAliases'],
    }),
  });
};

export { useAccountAliases, useAddAccountAlias, useDeleteAccountAlias };
