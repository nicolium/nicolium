import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Spinner from '@/components/ui/spinner';
import { useClient } from '@/hooks/use-client';
import toast from '@/toast';

import type { AsyncRefreshHeader } from 'pl-api';

const messages = defineMessages({
  moreFound: {
    id: 'status.context.more_replies_found',
    defaultMessage: 'More replies found',
  },
  show: {
    id: 'status.context.show',
    defaultMessage: 'Show',
  },
  loadingInitial: {
    id: 'status.context.loading',
    defaultMessage: 'Loading',
  },
  success: {
    id: 'status.context.loading.success',
    defaultMessage: 'New replies loaded',
  },
  error: {
    id: 'status.context.loading.error',
    defaultMessage: 'Couldn’t load new replies',
  },
  retry: {
    id: 'status.context.retry',
    defaultMessage: 'Retry',
  },
});

/**
 * Simple debounce hook implementation
 */
const useDebouncedCallback = (
  callback: () => void,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean },
) => {
  const timeoutRef = useRef<any>(null);
  const isLeading = options?.leading ?? false;
  const isTrailing = options?.trailing ?? true;

  const debouncedFn = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLeading && !timeoutRef.current) {
      callback();
    }

    if (isTrailing) {
      timeoutRef.current = setTimeout(() => {
        callback();
        timeoutRef.current = null;
      }, delay);
    }
  }, [callback, delay, isLeading, isTrailing]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
};

type LoadingState = 'idle' | 'more-available' | 'loading' | 'success' | 'error';

/**
 * Age of thread below which we consider it new & fetch
 * replies more frequently
 */
const NEW_THREAD_AGE_THRESHOLD = 30 * 60_000;
/**
 * Interval at which we check for new replies for old threads
 */
const LONG_AUTO_FETCH_REPLIES_INTERVAL = 5 * 60_000;
/**
 * Interval at which we check for new replies for new threads.
 * Also used as a threshold to throttle repeated fetch calls
 */
const SHORT_AUTO_FETCH_REPLIES_INTERVAL = 60_000;
/**
 * Number of refresh_async checks at which an early fetch
 * will be triggered if there are results
 */
const LONG_RUNNING_FETCH_THRESHOLD = 3;

/**
 * Returns whether the thread is new, based on NEW_THREAD_AGE_THRESHOLD
 */
const getIsThreadNew = (statusCreatedAt: string) => {
  const now = new Date();
  const newThreadThreshold = new Date(now.getTime() - NEW_THREAD_AGE_THRESHOLD);

  return new Date(statusCreatedAt) > newThreadThreshold;
};

/**
 * This hook kicks off a background check for the async refresh job
 * and loads any newly found replies once the job has finished,
 * and when LONG_RUNNING_FETCH_THRESHOLD was reached and replies were found
 */
const useCheckForRemoteReplies = ({
  statusId,
  refreshHeader,
  isEnabled,
  onChangeLoadingState,
  onLoadContext,
}: {
  statusId: string;
  refreshHeader?: AsyncRefreshHeader;
  isEnabled: boolean;
  onChangeLoadingState: (state: LoadingState) => void;
  onLoadContext: () => Promise<void>;
}) => {
  const client = useClient();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleRefresh = (refresh: AsyncRefreshHeader, iteration: number) => {
      timeoutId = setTimeout(
        () => {
          client.asyncRefreshes.show(refresh.id).then((result) => {
            const { status, result_count } = result.async_refresh;

            // At three scheduled refreshes, we consider the job
            // long-running and attempt to fetch any new replies so far
            const isLongRunning = iteration === LONG_RUNNING_FETCH_THRESHOLD;

            // If the refresh status is not finished and not long-running,
            // we just schedule another refresh and exit
            if (status === 'running' && !isLongRunning) {
              scheduleRefresh(refresh, iteration + 1);
              return;
            }

            // Exit if there's nothing to fetch
            if (result_count === 0) {
              if (status === 'finished') {
                onChangeLoadingState('idle');
              } else {
                scheduleRefresh(refresh, iteration + 1);
              }
              return;
            }

            // A positive result count means there _might_ be new replies,
            // so we fetch the context in the background to check if there
            // are any new replies.
            // If so, they will populate `contexts.pendingReplies[statusId]`
            onLoadContext()
              .then(() => {
                // Reset loading state to `idle`. If the fetch has
                // resulted in new pending replies, the `hasPendingReplies`
                // flag will switch the loading state to 'more-available'
                if (status === 'finished') {
                  onChangeLoadingState('idle');
                } else {
                  // Keep background fetch going if `isLongRunning` is true
                  scheduleRefresh(refresh, iteration + 1);
                }
              })
              .catch(() => {
                onChangeLoadingState('error');
              });
          });
        },
        (refresh.retry ?? 1) * 1000,
      );
    };

    if (refreshHeader && isEnabled) {
      scheduleRefresh(refreshHeader, 1);
      onChangeLoadingState('loading');
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onChangeLoadingState, onLoadContext, statusId, refreshHeader, isEnabled, client]);
};

/**
 * Custom hook for detecting if the document is visible
 */
const useIsDocumentVisible = (onChange?: (isVisible: boolean) => void) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      setIsVisible(newVisibility);
      onChange?.(newVisibility);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onChange]);

  return isVisible;
};

interface IRefreshController {
  statusId: string;
  statusCreatedAt: string;
  isLocal: boolean;
  asyncRefreshHeader?: AsyncRefreshHeader;
  onLoadContext: () => Promise<void>;
}

/**
 * This component fetches new post replies in the background
 * and gives users the option to show them.
 *
 * The following three scenarios are handled:
 *
 * 1. When the browser tab is visible, replies are refetched periodically
 *    (more frequently for new posts, less frequently for old ones)
 * 2. Replies are refetched when the browser tab is refocused
 *    after it was hidden or minimised
 * 3. For remote posts, remote replies that might not yet be known to the
 *    server are imported & fetched using the AsyncRefresh API.
 */
const RefreshController: React.FC<IRefreshController> = ({
  statusId,
  statusCreatedAt,
  isLocal,
  asyncRefreshHeader,
  onLoadContext,
}) => {
  const intl = useIntl();

  const [partialLoadingState, setLoadingState] = useState<LoadingState>(
    asyncRefreshHeader ? 'loading' : 'idle',
  );

  const hasPendingReplies = false;
  const loadingState = hasPendingReplies ? 'more-available' : partialLoadingState;

  // Prevent too-frequent context calls
  const debouncedFetchContext = useDebouncedCallback(
    () => {
      void onLoadContext();
    },
    // Ensure the debounce is a bit shorter than the auto-fetch interval
    SHORT_AUTO_FETCH_REPLIES_INTERVAL - 500,
    {
      leading: true,
      trailing: false,
    },
  );

  const isDocumentVisible = useIsDocumentVisible((isVisible) => {
    // Auto-fetch new replies when the page is refocused
    if (isVisible && partialLoadingState !== 'loading') {
      void debouncedFetchContext();
    }
  });

  const onChangeLoadingState = (state: LoadingState) => {
    setLoadingState(state);
    switch (state) {
      case 'more-available':
        toast.info(messages.moreFound, {
          action: handleShowPending,
          actionLabel: messages.show,
        });
        break;
      case 'error':
        toast.info(messages.error, {
          action: handleShowPending,
          actionLabel: messages.retry,
        });
        break;
      case 'success':
        toast.info(messages.success);
        break;
      default:
        break;
    }
  };

  // Check for remote replies
  useCheckForRemoteReplies({
    statusId,
    refreshHeader: asyncRefreshHeader,
    isEnabled: isDocumentVisible && !isLocal,
    onChangeLoadingState,
    onLoadContext,
  });

  // Only auto-fetch new replies if there's no ongoing remote replies check
  const shouldAutoFetchReplies = isDocumentVisible && partialLoadingState !== 'loading';

  const autoFetchInterval = useMemo(() => {
    return getIsThreadNew(statusCreatedAt)
      ? SHORT_AUTO_FETCH_REPLIES_INTERVAL
      : LONG_AUTO_FETCH_REPLIES_INTERVAL;
  }, [statusCreatedAt]);

  useEffect(() => {
    if (!shouldAutoFetchReplies) return;

    const intervalId = setInterval(() => {
      debouncedFetchContext();
    }, autoFetchInterval);

    return () => clearInterval(intervalId);
  }, [shouldAutoFetchReplies, autoFetchInterval, debouncedFetchContext]);

  useEffect(() => {
    // Hide success message after a short delay
    if (loadingState === 'success') {
      const timeoutId = setTimeout(() => {
        setLoadingState('idle');
      }, 2500);

      return () => clearTimeout(timeoutId);
    }
  }, [loadingState]);

  const handleShowPending = useCallback(() => {
    onLoadContext().then(() => {
      toast.success(messages.success);
      setLoadingState('success');
    });
  }, [onLoadContext]);

  if (loadingState === 'loading') {
    return (
      <div
        className='flex items-center justify-center'
        role='status'
        aria-live='polite'
        aria-label={intl.formatMessage(messages.loadingInitial)}
      >
        <Spinner withText={false} />
      </div>
    );
  }

  return null;
};

export { RefreshController as default };
