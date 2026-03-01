import { PaginatedResponse } from 'pl-api';

import type { InfiniteData } from '@tanstack/react-query';

const filterById =
  (filteredId: string | Array<string>) =>
  (data: InfiniteData<PaginatedResponse<string>> | undefined) => {
    if (data) {
      let found = 0;
      let pages = data.pages.map(
        (page) =>
          new PaginatedResponse(
            page.items.filter((id) => {
              if (Array.isArray(filteredId)) {
                const includes = filteredId.includes(id);
                if (includes) found += 1;
                return !includes;
              }
              if (id === filteredId) found = 1;
              return id !== filteredId;
            }),
            page,
          ),
      );
      if (found) {
        pages.forEach((page) => {
          if (page.total) page.total -= found;
        });
      }
      return {
        ...data,
        pages,
      };
    }
  };

export { filterById };
