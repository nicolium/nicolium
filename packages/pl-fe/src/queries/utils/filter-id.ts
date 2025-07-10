import { create } from 'mutative';

import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

const filterById = (filteredId: string) => (data: InfiniteData<PaginatedResponse<string, true>, unknown> | undefined) => {
  if (data) {
    return create((data), data => {
      let found = false;
      data.pages.forEach((page) => {
        page.items = page.items.filter((id) => {
          if (id === filteredId) found = true;
          return id !== filteredId;
        });
      });

      if (found) data.pages.forEach((page) => {
        if (page.total) page.total -= 1;
      });
    });
  }
};

export { filterById };
