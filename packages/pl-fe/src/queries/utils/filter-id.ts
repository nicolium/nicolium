import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

const filterById = (filteredId: string) => (data: InfiniteData<PaginatedResponse<string, true>, unknown> | undefined) => {
  if (data) {
    let found = false;
    let pages = data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter((id) => {
      if (id === filteredId) found = true;
      return id !== filteredId;
    }) }));

    if (found) pages = pages.map(({ total, ...page }) => ({ total: total ? total - 1 : total, ...page }));

    return {
      ...data,
      pages,
    };
  }
};

export { filterById };
