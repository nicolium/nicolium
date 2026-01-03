import { Outlet, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { Suspense, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import { fetchConfig } from 'pl-fe/actions/admin';
import { fetchFilters } from 'pl-fe/actions/filters';
import { fetchMarker } from 'pl-fe/actions/markers';
import { expandNotifications } from 'pl-fe/actions/notifications';
import { register as registerPushNotifications } from 'pl-fe/actions/push-notifications/registerer';
import { fetchHomeTimeline } from 'pl-fe/actions/timelines';
import { useUserStream } from 'pl-fe/api/hooks/streaming/use-user-stream';
import SidebarNavigation from 'pl-fe/components/sidebar-navigation';
import ThumbNavigation from 'pl-fe/components/thumb-navigation';
import Layout from 'pl-fe/components/ui/layout';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { prefetchFollowRequests } from 'pl-fe/queries/accounts/use-follow-requests';
import { queryClient } from 'pl-fe/queries/client';
import { prefetchCustomEmojis } from 'pl-fe/queries/instance/use-custom-emojis';
import { scheduledStatusesQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';
import { useSettings } from 'pl-fe/stores/settings';
import { useShoutboxSubscription } from 'pl-fe/stores/shoutbox';
import { useIsDropdownMenuOpen } from 'pl-fe/stores/ui';
import { getVapidKey } from 'pl-fe/utils/auth';
import { isStandalone } from 'pl-fe/utils/state';

import BackgroundShapes from './components/background-shapes';
import {
  ModalRoot,
  AccountHoverCard,
  ChatWidget,
  DropdownNavigation,
  StatusHoverCard,
} from './util/async-components';
import GlobalHotkeys from './util/global-hotkeys';

// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import 'pl-fe/components/status';

const UI: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement | null>(null);
  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const vapidKey = useAppSelector(state => getVapidKey(state));
  const client = useClient();
  const instance = useInstance();
  const { theme } = useSettings();

  const isDropdownMenuOpen = useIsDropdownMenuOpen();
  const standalone = useAppSelector(isStandalone);

  useShoutboxSubscription();

  const { isDragging } = useDraggedFiles(node);

  const handleServiceWorkerPostMessage = ({ data }: MessageEvent) => {
    if (data.type === 'navigate') {
      navigate({ to: data.path });
    } else {
      console.warn('Unknown message type:', data.type);
    }
  };

  const handleDragEnter = (e: DragEvent) => e.preventDefault();
  const handleDragLeave = (e: DragEvent) => e.preventDefault();
  const handleDragOver = (e: DragEvent) => e.preventDefault();
  const handleDrop = (e: DragEvent) => e.preventDefault();

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    prefetchCustomEmojis(client);

    dispatch(fetchHomeTimeline());

    dispatch(expandNotifications())
      // @ts-ignore
      .then(() => dispatch(fetchMarker(['notifications'])))
      .catch(console.error);

    if (account.is_admin && features.pleromaAdminAccounts) {
      dispatch(fetchConfig());
    }

    if (features.filters || features.filtersV2) {
      setTimeout(() => dispatch(fetchFilters()), 500);
    }

    if (account.locked) {
      setTimeout(() => prefetchFollowRequests(client), 700);
    }

    if (features.scheduledStatuses) {
      setTimeout(() => {
        queryClient.prefetchInfiniteQuery(scheduledStatusesQueryOptions);
      }, 900);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerPostMessage);
    }

    if (window.Notification?.permission === 'default') {
      window.setTimeout(() => Notification.requestPermission(), 120 * 1000);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  useUserStream();

  // The user has logged in
  useEffect(() => {
    if (instance.fetched) loadAccountData();
  }, [!!account, instance.fetched]);

  useEffect(() => {
    dispatch(registerPushNotifications());
  }, [vapidKey]);

  // Wait for login to succeed or fail
  if (me === null) return null;

  const style: React.CSSProperties = {
    pointerEvents: isDropdownMenuOpen ? 'none' : undefined,
  };

  const fullWidth = false; // !!matchPath(history.location.pathname, '/deck');

  return (
    <GlobalHotkeys node={node}>
      <div ref={node} style={style}>
        <div
          className={clsx('⁂-dragging-area', {
            '⁂-dragging-area--dragging': isDragging,
          })}
        />

        {(theme?.backgroundGradient ?? true) && <BackgroundShapes />}

        <div className='⁂-layout__container'>
          <Layout fullWidth={fullWidth}>
            <Layout.Sidebar shrink={fullWidth}>
              {!(standalone && !me) && <SidebarNavigation shrink={fullWidth} />}
            </Layout.Sidebar>

            <Outlet />
          </Layout>

          <Suspense>
            <DropdownNavigation />
          </Suspense>

          {me && features.chats && (
            <div className='hidden xl:block'>
              <Suspense fallback={<div className='fixed bottom-0 z-[99] flex h-16 w-96 animate-pulse flex-col rounded-t-lg bg-white shadow-3xl dark:bg-gray-900 ltr:right-5 rtl:left-5' />}>
                <ChatWidget />
              </Suspense>
            </div>
          )}

          <ThumbNavigation />

          <Suspense>
            <AccountHoverCard />
          </Suspense>

          <Suspense>
            <StatusHoverCard />
          </Suspense>
        </div>
      </div>
      <Suspense>
        <ModalRoot />
      </Suspense>

      <Toaster
        position='top-right'
        containerClassName='top-4'
      />
    </GlobalHotkeys>
  );
});

export { UI as default };
