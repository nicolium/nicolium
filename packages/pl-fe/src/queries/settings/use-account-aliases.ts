import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import toast from '@/toast';

const messages = defineMessages({
  createSuccess: { id: 'aliases.success.add', defaultMessage: 'Account alias created successfully' },
  removeSuccess: { id: 'aliases.success.remove', defaultMessage: 'Account alias removed successfully' },
});

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
    onSuccess: () =>{
      toast.success(messages.createSuccess);
    },
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
    onSuccess: () =>{
      toast.success(messages.removeSuccess);
    },
    onSettled: () => queryClient.invalidateQueries({
      queryKey: ['settings', 'accountAliases'],
    }),
  });
};

export { useAccountAliases, useAddAccountAlias, useDeleteAccountAlias };
