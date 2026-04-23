import { autoUpdate, flip, shift, size, useFloating } from '@floating-ui/react';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect } from 'react';

import { showStatusHoverCard } from '@/components/statuses/hover-status-wrapper';
import StatusContainer from '@/components/statuses/status-container';
import { useTransitionStyles } from '@/hooks/use-transition-styles';
import { useStatus } from '@/queries/statuses/use-status';
import { useStatusHoverCardActions, useStatusHoverCardStore } from '@/stores/status-hover-card';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const router = useRouter();

  const { statusId, ref } = useStatusHoverCardStore();
  const { closeStatusHoverCard, updateStatusHoverCard } = useStatusHoverCardActions();

  useStatus(statusId ?? undefined);

  useEffect(() => {
    const unlisten = router.subscribe('onLoad', ({ pathChanged }) => {
      if (pathChanged) {
        showStatusHoverCard.cancel();
        closeStatusHoverCard(true);
      }
    });

    return () => {
      unlisten();
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
      className={clsx({
        'absolute left-0 top-0 z-50 w-[500px] transition-opacity': true,
        'opacity-100': visible,
        'pointer-events-none opacity-0': !visible,
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
        className='isolate black:rounded-xl black:border black:border-gray-800'
        key={statusId}
        id={statusId}
        hoverable={false}
        hideActionBar
        muted
      />
    </div>
  );
};

export { StatusHoverCard as default };
