import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import React, { useMemo } from 'react';
import * as v from 'valibot';

import NotificationsColumn from '@/columns/notifications';
import Column from '@/components/ui/column';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/stores/instance';
import { type Features, instanceSchema } from 'pl-api';

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

const rootRoute = createRootRouteWithContext<RouterContext>()();

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <Column>
      <NotificationsColumn multiColumn />
    </Column>
  ),
});

const routeTree = rootRoute.addChildren([notificationsRoute]);

const useRoutes = (initialUrl: string) => useMemo(() => {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialUrl],
  });

  return createRouter({
    routeTree,
    context: {
      instance: v.parse(instanceSchema, {}),
      features: {} as Features,
    },
    history: memoryHistory,
  });
}, []);

interface IDeckColumn {}

const DeckColumn: React.FC<IDeckColumn> = () => {
  const instance = useInstance();
  const features = useFeatures();

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
    }),
    [features.version],
  );

  const router = useRoutes('/notifications');

  return <RouterProvider router={router} context={context} />;
};

export { DeckColumn };
