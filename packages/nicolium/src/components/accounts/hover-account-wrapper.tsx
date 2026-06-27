import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useContext, useRef } from 'react';

import { useScopeUrl } from '@/hooks/use-scope-url';
import { DeckColumnIdContext } from '@/pages/deck/components/deck-column-config';
import { useAccountHoverCardActions } from '@/stores/account-hover-card';
import { isMobile } from '@/utils/is-mobile';

const showAccountHoverCard = debounce(
  (
    openAccountHoverCard: (
      ref: React.RefObject<HTMLDivElement | null>,
      accountId: string,
      columnId?: string,
      scopeUrl?: string,
    ) => void,
    ref: React.RefObject<HTMLDivElement | null>,
    accountId: string,
    columnId?: string,
    scopeUrl?: string,
  ) => {
    openAccountHoverCard(ref, accountId, columnId, scopeUrl);
  },
  300,
);

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
    const columnId = useContext(DeckColumnIdContext) || undefined;
    const scopeUrl = useScopeUrl();

    const handleMouseEnter = () => {
      if (!accountId) return;

      if (!isMobile(window.innerWidth)) {
        showAccountHoverCard(openAccountHoverCard, ref, accountId, columnId, scopeUrl);
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

HoverAccountWrapper.displayName = 'HoverAccountWrapper';

export { HoverAccountWrapper as default, showAccountHoverCard };
