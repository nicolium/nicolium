import { create } from 'mutative';

import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

const filterById =
  (filteredId: string | Array<string>) =>
  (data: InfiniteData<PaginatedResponse<string>> | undefined) => {
    if (data) {
      return create(data, (data) => {
        let found = 0;
        data.pages.forEach((page) => {
          page.items = page.items.filter((id) => {
            if (Array.isArray(filteredId)) {
              const includes = filteredId.includes(id);
              if (includes) found += 1;
              return !includes;
            }
            if (id === filteredId) found = 1;
            return id !== filteredId;
          });
        });

        if (found)
          data.pages.forEach((page) => {
            if (page.total) page.total -= found;
          });
      });
    }
  };

export { filterById };
