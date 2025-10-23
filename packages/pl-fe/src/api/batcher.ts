import { bufferScheduler, create, keyResolver } from '@yornaath/batshit';
import memoize from 'lodash/memoize';

import type { PlApiClient } from 'pl-api';

const relationships = memoize((client: PlApiClient) => create({
  fetcher: (ids: string[]) => client.accounts.getRelationships(ids),
  resolver: keyResolver('id'),
  scheduler: bufferScheduler(200),
}));

// TODO: proper multi-client support
const translations = memoize((lang: string, client: PlApiClient) => create({
  fetcher: (ids: string[]) => client.statuses.translateStatuses(ids, lang),
  resolver: keyResolver('id'),
  scheduler: bufferScheduler(100),
}));

const batcher = {
  relationships,
  translations,
};

export { batcher };
