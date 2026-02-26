import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryKeys } from '@/queries/keys';

type Embed = {
  type: string;
  version: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  cache_age: number;
  html: string;
  width: number | null;
  height: number | null;
};

/** Fetch OEmbed information for a status by its URL. */
// https://github.com/mastodon/mastodon/blob/main/app/controllers/api/oembed_controller.rb
// https://github.com/mastodon/mastodon/blob/main/app/serializers/oembed_serializer.rb
const useEmbed = (url: string) => {
  const client = useClient();

  return useQuery<Embed>({
    queryKey: queryKeys.embed.show(url),
    queryFn: () => client.oembed.getOembed(url),
  });
};

export { useEmbed as default };
