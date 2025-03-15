import { create } from 'mutative';

import { getClient } from 'pl-fe/api';

import { queryClient } from '../client';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

const oauthTokensQueryOptions = makePaginatedResponseQueryOptions(
  ['security', 'oauthTokens'],
  (client) => client.settings.getOauthTokens(),
)();

const revokeOauthTokenMutationOptions = (oauthTokenId: string) => mutationOptions({
  mutationKey: ['security', 'oauthTokens', oauthTokenId],
  mutationFn: () => getClient().settings.deleteOauthToken(oauthTokenId),
  onSettled: () => {
    queryClient.setQueryData(oauthTokensQueryOptions.queryKey, (data) => create(data, (draft) => {
      draft?.pages.forEach(page => page.items = page.items.filter(({ id }) => id !== oauthTokenId));
    }));
  },
});

export { oauthTokensQueryOptions, revokeOauthTokenMutationOptions };
