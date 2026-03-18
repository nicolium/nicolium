import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getPointerPosition } from '@/components/media/video';

interface ISlider {
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-valuetext'?: string;
  /** Value between 0 and 1. */
  value: number;
  /** Callback when the value changes. */
  onChange(value: number): void;
}

/** Draggable slider component. */
const Slider: React.FC<ISlider> = ({
  id,
  value,
  onChange,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-valuetext': ariaValueText,
}) => {
  const node = useRef<HTMLDivElement>(null);
  const keyboardAnimationTimeout = useRef<number | null>(null);
  const [animateKeyboardInput, setAnimateKeyboardInput] = useState<boolean>(false);

  const clearKeyboardAnimation = useCallback(() => {
    if (keyboardAnimationTimeout.current !== null) {
      window.clearTimeout(keyboardAnimationTimeout.current);
      keyboardAnimationTimeout.current = null;
    }

    setAnimateKeyboardInput(false);
  }, []);

  const triggerKeyboardAnimation = useCallback(() => {
    setAnimateKeyboardInput(true);

    if (keyboardAnimationTimeout.current !== null) {
      window.clearTimeout(keyboardAnimationTimeout.current);
    }

    keyboardAnimationTimeout.current = window.setTimeout(() => {
      setAnimateKeyboardInput(false);
      keyboardAnimationTimeout.current = null;
    }, 120);
  }, []);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    clearKeyboardAnimation();

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

      triggerKeyboardAnimation();
      onChange(nextValue);
    }
  };

  useEffect(() => {
    return () => {
      if (keyboardAnimationTimeout.current !== null) {
        window.clearTimeout(keyboardAnimationTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className={clsx('⁂-slider', animateKeyboardInput && '⁂-slider--animate')}
      onMouseDown={handleMouseDown}
      ref={node}
    >
      <div className='⁂-slider__track' />
      <div className='⁂-slider__fill' style={{ width: `${value * 100}%` }} />
      <span
        id={id}
        className='⁂-slider__thumb'
        tabIndex={0}
        style={{ left: `${value * 100}%` }}
        role='slider'
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={ariaValueText}
        aria-orientation='horizontal'
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export { Slider as default };
