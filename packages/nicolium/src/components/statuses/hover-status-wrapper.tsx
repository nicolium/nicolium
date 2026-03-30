import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef } from 'react';

import { useStatusHoverCardActions } from '@/stores/status-hover-card';
import { isMobile, userTouching } from '@/utils/is-mobile';

const showStatusHoverCard = debounce((openStatusHoverCard, ref, statusId) => {
  openStatusHoverCard(ref, statusId);
}, 300);

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
  const Elem: keyof React.JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      showStatusHoverCard(openStatusHoverCard, ref, statusId);
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

      openStatusHoverCard(ref as React.RefObject<HTMLDivElement>, statusId);
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
