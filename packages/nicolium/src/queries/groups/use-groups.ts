import { useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useGroupsQuery = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.groupLists.myGroups,
    queryFn: () =>
      client.experimental.groups.getGroups().then((groups) => {
        for (const group of groups) {
          queryClient.setQueryData(
            scopedQueryKey(queryKeys.groups.show(group.id), scopeUrl),
            group,
          );
        }

        return groups.map(({ id }) => id);
      }),
    enabled: isLoggedIn,
  });
};

export { useGroupsQuery };
