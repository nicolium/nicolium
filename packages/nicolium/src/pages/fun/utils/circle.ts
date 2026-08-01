// Loosely adapted from twitter-interaction-circles, licensed under MIT License
// https://github.com/duiker101/twitter-interaction-circles

import type { PaginatedResponse, PlApiClient, Status } from 'pl-api';

interface Interaction {
  acct: string;
  avatar?: string;
  avatar_description?: string;
  replies: number;
  reblogs: number;
  favourites: number;
}

const processCircle =
  (
    client: PlApiClient,
    me: string,
    setProgress: (progress: {
      state:
        | 'pending'
        | 'fetchingStatuses'
        | 'fetchingFavourites'
        | 'fetchingAvatars'
        | 'drawing'
        | 'done';
      progress: number;
    }) => void,
  ) =>
  async () => {
    setProgress({ state: 'pending', progress: 0 });

    const interactions: Record<string, Interaction> = {};

    const initInteraction = (accountId: string) => {
      if (interactions[accountId]) return;
      interactions[accountId] = {
        acct: '',
        replies: 0,
        reblogs: 0,
        favourites: 0,
      };
    };

    const fetchStatuses = async (next: (() => Promise<PaginatedResponse<Status>>) | null) => {
      const response = await (next?.() ?? client.accounts.getAccountStatuses(me, { limit: 40 }));

      response.items.forEach((status) => {
        if (!['public', 'unlisted'].includes(status.visibility)) return;

        if (status.reblog) {
          if (status.reblog.account.id === me) return;

          initInteraction(status.reblog.account.id);
          const interaction = interactions[status.reblog.account.id];

          interaction.reblogs += 1;
          interaction.acct = status.reblog.account.acct;
          interaction.avatar = status.reblog.account.avatar_static || status.reblog.account.avatar;
          interaction.avatar_description = status.reblog.account.avatar_description;
        } else if (status.in_reply_to_account_id) {
          if (status.in_reply_to_account_id === me) return;

          initInteraction(status.in_reply_to_account_id);
          const interaction = interactions[status.in_reply_to_account_id];

          interaction.replies += 1;
        } else if (status.quote && 'quoted_status' in status.quote && status.quote.quoted_status) {
          if (status.quote.quoted_status.account.id === me) return;

          initInteraction(status.quote.quoted_status.account.id);
          const interaction = interactions[status.quote.quoted_status.account.id];
          interaction.acct = status.quote.quoted_status.account.acct;
          interaction.avatar =
            status.quote.quoted_status.account.avatar_static ||
            status.quote.quoted_status.account.avatar;
          interaction.avatar_description = status.quote.quoted_status.account.avatar_description;

          interaction.reblogs += 1;
        }
      });

      return response.next;
    };

    const fetchFavourites = async (next: (() => Promise<PaginatedResponse<Status>>) | null) => {
      // limit 40
      const response = await (next?.() ?? client.myAccount.getFavourites({ limit: 40 }));

      response.items.forEach((status) => {
        if (status.account.id === me) return;
        if (!['public', 'unlisted'].includes(status.visibility)) return;

        initInteraction(status.account.id);
        const interaction = interactions[status.account.id];

        interaction.favourites += 1;
        interaction.acct = status.account.acct;
        interaction.avatar = status.account.avatar_static || status.account.avatar;
        interaction.avatar_description = status.account.avatar_description;
      });

      return response.next;
    };

    for (let next: (() => Promise<PaginatedResponse<Status>>) | null = null, i = 0; i < 20; i++) {
      next = await fetchStatuses(next);
      setProgress({ state: 'fetchingStatuses', progress: (i / 20) * 40 });
      if (!next) break;
    }

    for (let next: (() => Promise<PaginatedResponse<Status>>) | null = null, i = 0; i < 20; i++) {
      next = await fetchFavourites(next);
      setProgress({ state: 'fetchingFavourites', progress: 40 + (i / 20) * 40 });
      if (!next) break;
    }

    const result = await Promise.all(
      Object.entries(interactions)
        .map(([id, { acct, avatar, avatar_description, favourites, reblogs, replies }]) => {
          const score = favourites + replies * 1.1 + reblogs * 1.3;
          return { id, acct, avatar, avatar_description, score };
        })
        .toSorted((a, b) => b.score - a.score)
        .slice(0, 49)
        .map(async (interaction, index, array) => {
          setProgress({ state: 'fetchingAvatars', progress: 80 + (index / array.length) * 10 });

          if (interaction.acct) return interaction;

          const account = await client.accounts.getAccount(interaction.id);

          interaction.acct = account.acct;
          interaction.avatar = account.avatar_static || account.avatar;
          interaction.avatar_description = account.avatar_description;

          return interaction;
        }),
    );

    return result;
  };

export { processCircle };
