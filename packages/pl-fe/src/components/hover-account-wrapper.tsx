import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef } from 'react';

import { useAccountHoverCardActions } from '@/stores/account-hover-card';
import { isMobile } from '@/utils/is-mobile';

const showAccountHoverCard = debounce((openAccountHoverCard, ref, accountId) => {
  openAccountHoverCard(ref, accountId);
}, 600);

interface IHoverAccountWrapper {
  accountId?: string;
  element?: 'div' | 'span' | 'bdi';
  className?: string;
  children: React.ReactNode;
}

/** Makes a profile hover card appear when the wrapped element is hovered. */
const HoverAccountWrapper: React.FC<IHoverAccountWrapper> = React.memo(
  ({ accountId, children, element: Elem = 'div', className }) => {
    const { openAccountHoverCard, closeAccountHoverCard } = useAccountHoverCardActions();

    const ref = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
      if (!accountId) return;

      if (!isMobile(window.innerWidth)) {
        showAccountHoverCard(openAccountHoverCard, ref, accountId);
      }
    };

    const handleMouseLeave = () => {
      showAccountHoverCard.cancel();
      setTimeout(() => {
        closeAccountHoverCard();
      }, 300);
    };

    const handleClick = () => {
      showAccountHoverCard.cancel();
      closeAccountHoverCard(true);
    };

    return (
      <Elem
        ref={ref}
        className={clsx('hover-account-wrapper', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </Elem>
    );
  },
);

export { HoverAccountWrapper as default, showAccountHoverCard };
