import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useContext, useRef } from 'react';

import { DeckColumnIdContext } from '@/pages/deck/components/deck-column-config';
import { useStatusHoverCardActions } from '@/stores/status-hover-card';
import { isMobile, userTouching } from '@/utils/is-mobile';

const showStatusHoverCard = debounce(
  (
    openStatusHoverCard: (
      ref: React.RefObject<HTMLDivElement | null>,
      statusId: string,
      columnId?: string,
    ) => void,
    ref: React.RefObject<HTMLDivElement | null>,
    statusId: string,
    columnId?: string,
  ) => {
    openStatusHoverCard(ref, statusId, columnId);
  },
  300,
);

interface IHoverStatusWrapper {
  statusId: string;
  inline: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Makes a status hover card appear when the wrapped element is hovered. */
const HoverStatusWrapper: React.FC<IHoverStatusWrapper> = ({
  statusId,
  children,
  inline = false,
  className,
}) => {
  const { openStatusHoverCard, closeStatusHoverCard } = useStatusHoverCardActions();

  const ref = useRef<HTMLDivElement>(null);
  const columnId = useContext(DeckColumnIdContext) || undefined;
  const Elem: keyof React.JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      showStatusHoverCard(openStatusHoverCard, ref, statusId, columnId);
    }
  };

  const handleMouseLeave = () => {
    showStatusHoverCard.cancel();
    setTimeout(() => {
      closeStatusHoverCard();
    }, 200);
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (userTouching.matches) {
      event.preventDefault();
      event.stopPropagation();

      openStatusHoverCard(ref as React.RefObject<HTMLDivElement | null>, statusId, columnId);
      return;
    }

    showStatusHoverCard.cancel();
    closeStatusHoverCard(true);
  };

  return (
    <Elem
      ref={ref}
      className={clsx('hover-status-wrapper', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Elem>
  );
};

export { HoverStatusWrapper as default, showStatusHoverCard };
