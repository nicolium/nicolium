
import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

const useBirthdayReminders = (month: number, day: number) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: ['accountsLists', 'birthdayReminders', month, day],
    queryFn: () => client.accounts.getBirthdays(day, month).then((accounts) => {
      dispatch(importEntities({ accounts }));

      return accounts.map(({ id }) => id);
    }),
    enabled: isLoggedIn,
  });
};

export { useBirthdayReminders };
