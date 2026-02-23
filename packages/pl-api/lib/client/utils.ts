import type { PlApiBaseClient } from '../client-base';

const utils = (client: PlApiBaseClient) => ({
  paginatedGet: client.paginatedGet.bind(client),
});

export { utils };
