import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryKeys } from '@/queries/keys';

const useBirthdayReminders = (month: number, day: number) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.accountsLists.birthdayReminders(month, day),
    queryFn: () =>
      client.accounts.getBirthdays(day, month).then((accounts) => {
        for (const account of accounts) {
          queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        }

        return accounts.map(({ id }) => id);
      }),
    enabled: isLoggedIn,
  });
};

export { useBirthdayReminders };
