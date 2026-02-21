import throttle from 'lodash/throttle';
import React, { useCallback, useRef } from 'react';

import { getPointerPosition } from '@/features/video';

interface IStepSlider {
  /** Value between 0 and the amount of steps minus one. */
  value: number;
  /** Steps available in the slider. */
  steps: number;
  /** Callback when the value changes. */
  onChange(value: number): void;
}

/** Slider allowing selecting integers in a given range. */
const StepSlider: React.FC<IStepSlider> = ({ value, steps, onChange }) => {
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

          slideamt = Math.floor((slideamt + 0.5 / steps) * (steps - 1));
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
        nextValue = value - 1;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        nextValue = value + 1;
        break;
      case 'PageDown':
      case 'Home':
        nextValue = 0;
        break;
      case 'PageUp':
      case 'End':
        nextValue = steps - 1;
        break;
      default:
        break;
    }

    if (nextValue !== null) {
      event.preventDefault();
      if (nextValue < 0) {
        nextValue = 0;
      } else if (nextValue > steps - 1) {
        nextValue = steps - 1;
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
        style={{ width: `${(value / (steps - 1)) * 100}%` }}
      />
      {[...Array(steps).fill(undefined)].map((_, step) => (
        <span
          key={step}
          className='absolute top-1/2 z-10 h-3 w-1 -translate-y-1/2 bg-accent-300'
          style={{ left: `${(step / (steps - 1)) * 100}%` }}
        />
      ))}
      <span
        className='absolute top-1/2 z-10 -ml-1.5 size-3 -translate-y-1/2 rounded-full bg-accent-500 shadow'
        tabIndex={0}
        role='slider'
        aria-valuemin={0}
        aria-valuemax={steps - 1}
        aria-valuenow={value}
        aria-orientation='horizontal'
        onKeyDown={handleKeyDown}
        style={{ left: `calc(${(value / (steps - 1)) * 100}% + 0.125rem)` }}
      />
    </div>
  );
};

export { StepSlider as default };
