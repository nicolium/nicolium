import { autoUpdate, flip, shift, useFloating, useTransitionStyles } from '@floating-ui/react';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import { showStatusHoverCard } from '@/components/hover-status-wrapper';
import StatusContainer from '@/containers/status-container';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useStatusHoverCardActions, useStatusHoverCardStore } from '@/stores/status-hover-card';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const intl = useIntl();

  const { statusId, ref } = useStatusHoverCardStore();
  const { closeStatusHoverCard, updateStatusHoverCard } = useStatusHoverCardActions();

  const status = useAppSelector(state => state.statuses[statusId!]);

  useEffect(() => {
    if (statusId && !status) {
      dispatch(fetchStatus(statusId, intl));
    }
  }, [statusId, status]);

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
        'absolute transition-opacity w-[500px] z-50 top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
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
