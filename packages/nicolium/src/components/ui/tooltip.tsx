import {
  arrow,
  autoUpdate,
  FloatingArrow,
  FloatingPortal,
  offset,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import React, { useRef, useState } from 'react';

import { useTransitionStyles } from '@/hooks/use-transition-styles';

interface ITooltip {
  /** Element to display the tooltip around. */
  children: React.ReactElement<any>;
  /** Text to display in the tooltip. */
  text: string;
  /** If disabled, it will render the children without wrapping them. */
  disabled?: boolean;
}

/**
 * Tooltip
 */
const Tooltip: React.FC<ITooltip> = ({ children, text, disabled = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(6),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context);
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    duration: {
      open: 200,
      close: 200,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  if (disabled) {
    return children;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}

      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...styles,
            }}
            className='tooltip'
            {...getFloatingProps()}
          >
            {text}

            <FloatingArrow ref={arrowRef} context={context} className='tooltip__arrow' />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export { Tooltip as default };
