import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  linkOptions,
  Outlet,
  RouterProvider,
  useRouter,
} from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { type Features, instanceSchema } from 'pl-api';
import React, { useEffect, useMemo } from 'react';
import * as v from 'valibot';

import NotificationsColumn from '@/columns/notifications';
import SearchColumn from '@/columns/search';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatures } from '@/hooks/use-features';
import { SearchInput } from '@/pages/search/search';
import { useInstance } from '@/stores/instance';

import type { DeckColumn as DeckColumnSchema } from '@/schemas/frontend-settings';

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

const RootRoute = () => {
  const { history } = useRouter();
  const [canGoBack, setCanGoBack] = React.useState(false);

  useEffect(() => {
    return history.subscribe(() => setCanGoBack(history.canGoBack));
  }, [history]);

  return (
    <>
      {canGoBack && <div className='deck__column__overlay' aria-hidden />}
      <div className='deck__column__content'>
        {canGoBack && (
          <CardHeader onBackClick={() => history.back()}>
            <CardTitle title='Notifications' />
          </CardHeader>
        )}
        <Outlet />
      </div>
    </>
  );
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => <NotificationsColumn multiColumn />,
});

const SearchDeckColumn = () => {
  const navigate = useNavigate({ from: searchRoute.fullPath });

  const { q: query = '', type = 'accounts', accountId } = searchRoute.useSearch();

  const setQuery = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, q: value }) });
  };

  return (
    <div className='flex flex-col gap-4'>
      <SearchInput query={query} setQuery={setQuery} />
      <SearchColumn query={query} type={type} accountId={accountId} multiColumn />
    </div>
  );
};

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: v.object({
    type: v.optional(v.picklist(['accounts', 'statuses', 'hashtags', 'links']), 'accounts'),
    q: v.optional(v.string()),
    accountId: v.optional(v.string()),
  }),
  component: () => <SearchDeckColumn />,
});

const routeTree = rootRoute.addChildren([notificationsRoute, searchRoute]);

const useDeckColumnRouter = (initialUrl: string) =>
  useMemo(() => {
    const memoryHistory = createMemoryHistory({
      initialEntries: [initialUrl],
    });

    return {
      router: createRouter({
        routeTree,
        context: {
          instance: v.parse(instanceSchema, {}),
          features: {} as Features,
        },
        history: memoryHistory,
      }),
      history: memoryHistory,
    };
  }, []);

const getInitialUrl = (column: DeckColumnSchema) => {
  switch (column.type) {
    case 'notifications':
      return '/notifications';
    case 'search':
      return linkOptions({ to: '/search' });
    default:
      return '/notifications';
  }
};

interface IDeckColumn {
  column: DeckColumnSchema;
}

const DeckColumn: React.FC<IDeckColumn> = ({ column }) => {
  const instance = useInstance();
  const features = useFeatures();

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
    }),
    [features.version],
  );

  const { router, history } = useDeckColumnRouter(getInitialUrl(column));

  console.log(history);

  return (
    <div className={`deck__column deck__column--${column.columnWidth}`}>
      <CardHeader>
        <CardTitle title='Notifications' />
      </CardHeader>
      <RouterProvider router={router} context={context} />
    </div>
  );
};

export { DeckColumn };
