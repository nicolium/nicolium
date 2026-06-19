import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useHashtag = (tag: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.hashtags.show(tag.toLocaleLowerCase()),
    queryFn: () => client.myAccount.getTag(tag),
  });
};

export { useHashtag };
