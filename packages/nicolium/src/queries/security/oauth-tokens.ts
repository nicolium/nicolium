import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useOauthTokensQuery = makePaginatedResponseQuery(queryKeys.security.oauthTokens, (client) =>
  client.settings.getOauthTokens(),
);

const useRevokeOauthTokenMutation = (oauthTokenId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['security', 'oauthTokens', oauthTokenId],
    mutationFn: () => client.settings.deleteOauthToken(oauthTokenId),
    onSettled: () => {
      removePageItem(
        queryKeys.security.oauthTokens,
        oauthTokenId,
        (token: { id: string }, tokenId: string) => token.id === tokenId,
        true,
      );
    },
  });
};

export { useOauthTokensQuery, useRevokeOauthTokenMutation };
