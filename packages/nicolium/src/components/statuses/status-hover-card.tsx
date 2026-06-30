import { autoUpdate, flip, shift, size, useFloating } from '@floating-ui/react';
import { useRouter, type ListenerFn, type RouterEvent } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect } from 'react';

import { showStatusHoverCard } from '@/components/statuses/hover-status-wrapper';
import StatusContainer from '@/components/statuses/status-container';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useTransitionStyles } from '@/hooks/use-transition-styles';
import { deckColumnRouterRegistry } from '@/pages/deck/components/deck-column-router';
import { useStatus } from '@/queries/statuses/use-status';
import { useStatusHoverCardActions, useStatusHoverCardStore } from '@/stores/status-hover-card';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const router = useRouter();

  const { statusId, columnId, ref } = useStatusHoverCardStore();
  const { closeStatusHoverCard, updateStatusHoverCard } = useStatusHoverCardActions();

  useStatus(statusId ?? undefined);

  useEffect(() => {
    const handler: ListenerFn<RouterEvent> = ({ pathChanged }) => {
      if (pathChanged) {
        showStatusHoverCard.cancel();
        closeStatusHoverCard(true);
      }
    };

    const unlisten = router.subscribe('onLoad', handler);

    const columnUnlisten =
      columnId && deckColumnRouterRegistry.get(columnId)?.router.subscribe('onLoad', handler);

    return () => {
      unlisten();
      if (columnUnlisten) {
        columnUnlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (!statusId) return;
    if (!ref?.current) {
      showStatusHoverCard.cancel();
      closeStatusHoverCard(true);
    }

    let touchPosition = { x: 0, y: 0 };

    const handleDocumentTouchStart = (event: TouchEvent) => {
      touchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    };

    const handleDocumentTouchEnd = (event: TouchEvent) => {
      if (
        touchPosition.x === event.changedTouches[0].clientX &&
        touchPosition.y === event.changedTouches[0].clientY
      )
        return;
      showStatusHoverCard.cancel();
      closeStatusHoverCard(true);
    };

    document.addEventListener('touchstart', handleDocumentTouchStart);
    document.addEventListener('touchend', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, [!!statusId]);

  const { x, y, strategy, refs, context, placement } = useFloating({
    open: !!statusId,
    elements: {
      reference: ref?.current,
    },
    placement: 'top',
    middleware: [
      flip(),
      shift({
        padding: 8,
      }),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth - 8}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  const handleMouseEnter = () => {
    updateStatusHoverCard();
  };

  const handleMouseLeave = () => {
    closeStatusHoverCard(true);
  };

  if (!statusId) return null;

  return (
    <div
      className={clsx('status-hover-card', {
        'status-hover-card--visible': visible,
        'status-hover-card--hidden': !visible,
      })}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        ...styles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StatusContainer
        className='status-hover-card__status'
        key={statusId}
        id={statusId}
        columnId={columnId || undefined}
        hoverable={false}
        hideActionBar
        muted
      />
    </div>
  );
};

/** provides scopeUrl to StatusHoverCard */
const ScopedStatusHoverCard: React.FC<IStatusHoverCard> = (props) => {
  const scopeUrl = useStatusHoverCardStore((state) => state.scopeUrl);

  if (scopeUrl) {
    return (
      <CurrentAccountProvider accountUrl={scopeUrl}>
        <StatusHoverCard {...props} />
      </CurrentAccountProvider>
    );
  }

  return <StatusHoverCard {...props} />;
};

export { ScopedStatusHoverCard as default };
