import { Outlet, useMatch, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { Suspense, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { FormattedMessage } from 'react-intl';

import { register as registerPushNotifications } from '@/actions/push-notifications/registerer';
import SidebarNavigation from '@/components/navigation/sidebar-navigation';
import ThumbNavigation from '@/components/navigation/thumb-navigation';
import Layout from '@/components/ui/layout';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useUserStream } from '@/hooks/streaming/use-user-stream';
import { useClient } from '@/hooks/use-client';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { prefetchFollowRequests } from '@/queries/accounts/use-follow-requests';
import { useAdminConfig } from '@/queries/admin/use-config';
import { queryClient } from '@/queries/client';
import { prefetchCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { usePrefetchNotificationsMarker } from '@/queries/markers/use-markers';
import { usePrefetchNotifications } from '@/queries/notifications/use-notifications';
import { useFilters } from '@/queries/settings/use-filters';
import { scheduledStatusesQueryOptions } from '@/queries/statuses/scheduled-statuses';
import { newStatusRoute } from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useInstance, useInstanceStore } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useShoutboxSubscription } from '@/stores/shoutbox';
import { useTimelinesActions } from '@/stores/timelines';
import { useIsDropdownMenuOpen } from '@/stores/ui';
// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import '@/components/statuses/status';
import GlobalHotkeys from '@/utils/global-hotkeys';
import { useIsStandalone } from '@/utils/state';

import {
  ModalRoot,
  AccountHoverCard,
  ChatWidget,
  DropdownNavigation,
  StatusHoverCard,
} from './util/async-components';

const UI: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const node = useRef<HTMLDivElement | null>(null);
  const me = useCurrentAccount();
  const { data: account } = useOwnAccount();
  const features = useFeatures();
  const instance = useInstance();
  const vapidKey =
    useAuthStore((state) => state.app?.vapid_key) ?? instance.configuration.vapid.public_key;
  const client = useClient();
  const { openModal } = useModalsActions();
  const { resetErroredTimelines } = useTimelinesActions();

  const isDropdownMenuOpen = useIsDropdownMenuOpen();
  const standalone = useIsStandalone();
  const instanceFetched = useInstanceStore((state) => state.fetched);
  const { showChatWidget } = useSettings();
  const isNewStatusPage = !!useMatch({ from: newStatusRoute.id, shouldThrow: false });

  useAdminConfig();
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

  const handleDragEvents = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleSkipToContent = () => {
    document.querySelector('main')?.focus();
  };

  const handleOpenHotkeysModal = () => {
    openModal('HOTKEYS', undefined, document.getElementById('skip-link-hotkeys') || undefined);
  };

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    prefetchCustomEmojis(client);

    if (account.locked) {
      requestIdleCallback(() => prefetchFollowRequests(client), { timeout: 2000 });
    }

    if (features.scheduledStatuses) {
      requestIdleCallback(
        () => queryClient.prefetchInfiniteQuery(scheduledStatusesQueryOptions(client)),
        {
          timeout: 2000,
        },
      );
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
    document.addEventListener('dragenter', handleDragEvents);
    document.addEventListener('dragleave', handleDragEvents);
    document.addEventListener('dragover', handleDragEvents);
    document.addEventListener('drop', handleDragEvents);
    return () => {
      document.removeEventListener('dragenter', handleDragEvents);
      document.removeEventListener('dragleave', handleDragEvents);
      document.removeEventListener('dragover', handleDragEvents);
      document.removeEventListener('drop', handleDragEvents);
    };
  }, []);

  useUserStream();

  // The user has logged in
  useEffect(() => {
    if (instanceFetched) loadAccountData();
  }, [!!account, instanceFetched]);

  useEffect(() => {
    if (account) registerPushNotifications(client, account.id);
  }, [vapidKey, !!account]);

  useEffect(() => {
    resetErroredTimelines();
  }, [!!account]);

  // Wait for login to succeed or fail
  if (me === null) return null;

  const style: React.CSSProperties = {
    pointerEvents: isDropdownMenuOpen ? 'none' : undefined,
  };

  const fullWidth = false; // !!matchPath(history.location.pathname, '/deck');

  return (
    <GlobalHotkeys node={node}>
      <div ref={node} style={style}>
        <div className='⁂-skip-links'>
          <button onClick={handleSkipToContent}>
            <FormattedMessage id='skip_links.skip_to_content' defaultMessage='Skip to content' />
          </button>
          <button id='skip-link-hotkeys' onClick={handleOpenHotkeysModal}>
            <FormattedMessage
              id='navigation.keyboard_shortcuts'
              defaultMessage='Keyboard shortcuts'
            />
          </button>
        </div>
        <div
          className={clsx('⁂-dragging-area', {
            '⁂-dragging-area--dragging': isDragging,
          })}
        />

        <div className='⁂-layout__container'>
          <Layout fullWidth={fullWidth}>
            {!isNewStatusPage && (
              <Layout.Sidebar shrink={fullWidth}>
                {!(standalone && !me) && <SidebarNavigation shrink={fullWidth} />}
              </Layout.Sidebar>
            )}

            <Outlet />
          </Layout>

          <Suspense>
            <DropdownNavigation />
          </Suspense>

          {me && features.chats && showChatWidget && !isNewStatusPage && (
            <div className='⁂-chat-widget__container'>
              <Suspense fallback={<div className='⁂-chat-widget ⁂-chat-widget--placeholder' />}>
                <ChatWidget />
              </Suspense>
            </div>
          )}

          {!isNewStatusPage && <ThumbNavigation />}

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

      <Toaster position='top-right' containerClassName='⁂-toast__container' />
    </GlobalHotkeys>
  );
});

UI.displayName = 'UI';

export { UI as default };
