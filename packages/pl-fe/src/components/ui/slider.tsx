import throttle from 'lodash/throttle';
import React, { useCallback, useRef } from 'react';

import { getPointerPosition } from '@/features/video';

interface ISlider {
  /** Value between 0 and 1. */
  value: number;
  /** Callback when the value changes. */
  onChange(value: number): void;
}

/** Draggable slider component. */
const Slider: React.FC<ISlider> = ({ value, onChange }) => {
  const node = useRef<HTMLDivElement>(null);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    document.addEventListener('mousemove', handleMouseSlide, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchmove', handleMouseSlide, true);
    document.addEventListener('touchend', handleMouseUp, true);

    handleMouseSlide(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseSlide, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('touchmove', handleMouseSlide, true);
    document.removeEventListener('touchend', handleMouseUp, true);
  };

  const handleMouseSlide = useCallback(
    throttle((e) => {
      if (node.current) {
        const { x } = getPointerPosition(node.current, e);

        if (!isNaN(x)) {
          let slideamt = x;

          if (x > 1) {
            slideamt = 1;
          } else if (x < 0) {
            slideamt = 0;
          }

          onChange(slideamt);
        }
      }
    }, 60),
    [node.current],
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement> = (event) => {
    let nextValue: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        nextValue = value - 0.05;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        nextValue = value + 0.05;
        break;
      case 'PageDown':
      case 'Home':
        nextValue = 0;
        break;
      case 'PageUp':
      case 'End':
        nextValue = 1;
        break;
      default:
        break;
    }

    if (nextValue !== null) {
      event.preventDefault();
      if (nextValue < 0) {
        nextValue = 0;
      } else if (nextValue > 1) {
        nextValue = 1;
      }

      onChange(nextValue);
    }
  };

  return (
    <div
      className='relative inline-flex h-6 cursor-pointer transition'
      onMouseDown={handleMouseDown}
      ref={node}
    >
      <div className='absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-primary-200 dark:bg-primary-700' />
      <div
        className='absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-500'
        style={{ width: `${value * 100}%` }}
      />
      <span
        className='absolute top-1/2 z-10 -ml-1.5 size-3 -translate-y-1/2 rounded-full bg-accent-500 shadow'
        tabIndex={0}
        style={{ left: `${value * 100}%` }}
        role='slider'
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-orientation='horizontal'
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export { Slider as default };
