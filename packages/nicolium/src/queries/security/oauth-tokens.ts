import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useOauthTokensQuery = makePaginatedResponseQuery(queryKeys.security.oauthTokens, (client) =>
  client.settings.getOauthTokens(),
);

const useRevokeOauthTokenMutation = (oauthTokenId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['security', 'oauthTokens', oauthTokenId],
    mutationFn: () => client.settings.deleteOauthToken(oauthTokenId),
    onSettled: () => {
      removePageItem(
        scopedQueryKey(queryKeys.security.oauthTokens, scopeUrl),
        oauthTokenId,
        (token: { id: string }, tokenId: string) => token.id === tokenId,
        true,
      );
    },
  });
};

export { useOauthTokensQuery, useRevokeOauthTokenMutation };
