import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

const useHashtag = (tag: string) => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.hashtags.show(tag.toLocaleLowerCase()),
    queryFn: () => client.myAccount.getTag(tag),
  });
};

export { useHashtag };
