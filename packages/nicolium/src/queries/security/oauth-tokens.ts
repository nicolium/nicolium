import { getClient } from '@/api';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

const oauthTokensQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.security.oauthTokens,
  (client) => client.settings.getOauthTokens(),
)();

const revokeOauthTokenMutationOptions = (oauthTokenId: string) =>
  mutationOptions({
    mutationKey: ['security', 'oauthTokens', oauthTokenId],
    mutationFn: () => getClient().settings.deleteOauthToken(oauthTokenId),
    onSettled: () => {
      removePageItem(
        queryKeys.security.oauthTokens,
        oauthTokenId,
        (token: { id: string }, tokenId: string) => token.id === tokenId,
        true,
      );
    },
  });

export { oauthTokensQueryOptions, revokeOauthTokenMutationOptions };
