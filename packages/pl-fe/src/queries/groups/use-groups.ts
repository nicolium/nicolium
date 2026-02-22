import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

const useGroupsQuery = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['groupLists', 'myGroups'],
    queryFn: () =>
      client.experimental.groups.getGroups().then((groups) => {
        for (const group of groups) {
          queryClient.setQueryData(['groups', group.id], group);
        }

        return groups.map(({ id }) => id);
      }),
    enabled: isLoggedIn,
  });
};

export { useGroupsQuery };
