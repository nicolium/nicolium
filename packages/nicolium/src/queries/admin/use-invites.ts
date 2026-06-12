import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';

import { queryKeys } from '../keys';

import type { AdminCreateInviteTokenParams, AdminEmailInviteParams, AdminInvite } from 'pl-api';

const useInvites = () => {
  const client = useClient();

  return useQuery<ReadonlyArray<AdminInvite>>({
    queryKey: queryKeys.admin.invites,
    queryFn: () => client.admin.invites.getInvites(),
    placeholderData: [],
  });
};

const useCreateInviteTokenMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (params: AdminCreateInviteTokenParams) =>
      client.admin.invites.createInviteToken(params),
    onSuccess: (data) =>
      queryClient.setQueryData(queryKeys.admin.invites, (prevResult) =>
        prevResult ? [...prevResult, data] : [data],
      ),
  });
};

const useRevokeInviteTokenMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (token: string) => client.admin.invites.revokeInviteToken(token),
    onSuccess: (_, token) =>
      queryClient.setQueryData(queryKeys.admin.invites, (prevResult) =>
        prevResult?.map((invite) => (invite.token === token ? { ...invite, used: true } : invite)),
      ),
  });
};

const useEmailInviteMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (params: AdminEmailInviteParams) => client.admin.invites.emailInvite(params),
  });
};

export {
  useInvites,
  useCreateInviteTokenMutation,
  useRevokeInviteTokenMutation,
  useEmailInviteMutation,
};
