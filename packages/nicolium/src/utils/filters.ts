import type { Filter, FilterResult } from 'pl-api';

const escapeRegExp = (string: string) => string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

const regexFromFilters = (filters: Array<Filter>): RegExp | null => {
  if (filters.length === 0) return null;

  return new RegExp(
    filters
      .map((filter) =>
        filter.keywords
          .map((keyword) => {
            let expr = escapeRegExp(keyword.keyword);

            if (keyword.whole_word) {
              if (/^[\w]/.test(expr)) {
                expr = `\\b${expr}`;
              }

              if (/[\w]$/.test(expr)) {
                expr = `${expr}\\b`;
              }
            }

            return expr;
          })
          .join('|'),
      )
      .join('|'),
    'i',
  );
};

const checkFiltered = (index: string, filters: Array<Filter>): Array<FilterResult> =>
  filters.reduce<Array<FilterResult>>((results, filter) => {
    const { keywords, statuses, ...filterWithoutKeywords } = filter;

    for (const keyword of keywords) {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) expr = `\\b${expr}`;
        if (/[\w]$/.test(expr)) expr = `${expr}\\b`;
      }

      if (new RegExp(expr, 'i').test(index)) {
        results.push({
          filter: filterWithoutKeywords,
          keyword_matches: keyword.keyword,
          status_matches: null,
        });
      }
    }

    return results;
  }, []);

export { regexFromFilters, checkFiltered };
