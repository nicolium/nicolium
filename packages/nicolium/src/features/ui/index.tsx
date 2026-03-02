import { Outlet, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { Suspense, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import { fetchConfig } from '@/actions/admin';
import { register as registerPushNotifications } from '@/actions/push-notifications/registerer';
import { fetchHomeTimeline } from '@/actions/timelines';
import { useUserStream } from '@/api/hooks/streaming/use-user-stream';
import SidebarNavigation from '@/components/navigation/sidebar-navigation';
import ThumbNavigation from '@/components/navigation/thumb-navigation';
import Layout from '@/components/ui/layout';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useClient } from '@/hooks/use-client';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';
import { useOwnAccount } from '@/hooks/use-own-account';
import { prefetchFollowRequests } from '@/queries/accounts/use-follow-requests';
import { queryClient } from '@/queries/client';
import { prefetchCustomEmojis } from '@/queries/instance/use-custom-emojis';
import {
  usePrefetchNotifications,
  usePrefetchNotificationsMarker,
} from '@/queries/notifications/use-notifications';
import { useFilters } from '@/queries/settings/use-filters';
import { scheduledStatusesQueryOptions } from '@/queries/statuses/scheduled-statuses';
import { useSettings } from '@/stores/settings';
import { useShoutboxSubscription } from '@/stores/shoutbox';
import { useIsDropdownMenuOpen } from '@/stores/ui';
import { getVapidKey } from '@/utils/auth';
import { isStandalone } from '@/utils/state';

import BackgroundShapes from './components/background-shapes';
import {
  ModalRoot,
  AccountHoverCard,
  ChatWidget,
  DropdownNavigation,
  StatusHoverCard,
} from './util/async-components';
// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import '@/components/statuses/status';
import GlobalHotkeys from './util/global-hotkeys';

const UI: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement | null>(null);
  const me = useAppSelector((state) => state.me);
  const { data: account } = useOwnAccount();
  const features = useFeatures();
  const vapidKey = useAppSelector((state) => getVapidKey(state));
  const client = useClient();
  const instance = useInstance();
  const { theme } = useSettings();

  const isDropdownMenuOpen = useIsDropdownMenuOpen();
  const standalone = useAppSelector(isStandalone);

  useShoutboxSubscription();
  useFilters();
  usePrefetchNotifications();
  usePrefetchNotificationsMarker();

  const { isDragging } = useDraggedFiles(node);

  const handleServiceWorkerPostMessage = ({ data }: MessageEvent) => {
    if (data.type === 'navigate') {
      navigate({ to: data.path });
    } else {
      console.warn('Unknown message type:', data.type);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
  };
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
  };
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
  };

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    prefetchCustomEmojis(client);

    dispatch(fetchHomeTimeline());

    if (account.is_admin && features.pleromaAdminAccounts) {
      dispatch(fetchConfig());
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
            <div className='⁂-chat-widget__container'>
              <Suspense fallback={<div className='⁂-chat-widget--placeholder' />}>
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

      <Toaster position='top-right' containerClassName='top-4' />
    </GlobalHotkeys>
  );
});

UI.displayName = 'UI';

export { UI as default };
