import throttle from 'lodash/throttle';
import React, { useCallback, useRef } from 'react';

import { getPointerPosition } from '@/features/video';

interface IStepSlider {
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-valuetext'?: string;
  /** Value between 0 and the amount of steps minus one. */
  value: number;
  /** Steps available in the slider. */
  steps: number;
  /** Callback when the value changes. */
  onChange(value: number): void;
}

/** Slider allowing selecting integers in a given range. */
const StepSlider: React.FC<IStepSlider> = ({
  id,
  value,
  steps,
  onChange,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-valuetext': ariaValueText,
}) => {
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
    <div className='⁂-step-slider' onMouseDown={handleMouseDown} ref={node}>
      <div className='⁂-step-slider__track' />
      <div className='⁂-step-slider__fill' style={{ width: `${(value / (steps - 1)) * 100}%` }} />
      {[...Array(steps).fill(undefined)].map((_, step) => (
        <span
          key={step}
          className='⁂-step-slider__step'
          style={{ left: `${(step / (steps - 1)) * 100}%` }}
        />
      ))}
      <span
        id={id}
        className='⁂-step-slider__thumb'
        tabIndex={0}
        role='slider'
        aria-valuemin={0}
        aria-valuemax={steps - 1}
        aria-valuenow={value}
        aria-valuetext={ariaValueText}
        aria-orientation='horizontal'
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        onKeyDown={handleKeyDown}
        style={{ left: `calc(${(value / (steps - 1)) * 100}% + 0.125rem)` }}
      />
    </div>
  );
};

export { StepSlider as default };
