import { useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';
import { scopedQueryKey } from '@/queries/query';

const useBirthdayReminders = (month: number, day: number) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.accountsLists.birthdayReminders(month, day),
    queryFn: () =>
      client.accounts.getBirthdays(day, month).then((accounts) => {
        for (const account of accounts) {
          queryClient.setQueryData(
            scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
            account,
          );
        }

        return accounts.map(({ id }) => id);
      }),
    enabled: isLoggedIn,
  });
};

export { useBirthdayReminders };
