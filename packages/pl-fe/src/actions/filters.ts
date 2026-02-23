import type { Filter } from 'pl-api';

const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS' as const;

type FiltersAction = { type: typeof FILTERS_FETCH_SUCCESS; filters: Array<Filter> };

export { FILTERS_FETCH_SUCCESS, type FiltersAction };
