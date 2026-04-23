/* eslint-disable compat/compat */
/*
Copyright 2019 GUIBERT THOMAS

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Adapted from [react-simple-pull-to-refresh](https://github.com/thmsgbrt/react-simple-pull-to-refresh)
import React, { useRef, useEffect } from 'react';

import Spinner from './ui/spinner';

enum DIRECTION {
  UP = -0b01,
  DOWN = 0b01,
}

const isOverflowScrollable = (element: HTMLElement): boolean => {
  const overflowType: string = getComputedStyle(element).overflowY;
  if (element === document.scrollingElement && overflowType === 'visible') {
    return true;
  }

  if (overflowType !== 'scroll' && overflowType !== 'auto') {
    return false;
  }

  return true;
};

const isScrollable = (element: HTMLElement, direction: DIRECTION): boolean => {
  if (!isOverflowScrollable(element)) {
    return false;
  }

  if (direction === DIRECTION.DOWN) {
    const bottomScroll = element.scrollTop + element.clientHeight;
    return bottomScroll < element.scrollHeight;
  }

  if (direction === DIRECTION.UP) {
    return element.scrollTop > 0;
  }

  throw new Error('unsupported direction');
};

/**
 * Returns whether a given element or any of its ancestors (up to rootElement) is scrollable in a given direction.
 */
const isTreeScrollable = (element: HTMLElement, direction: DIRECTION): boolean => {
  if (isScrollable(element, direction)) {
    return true;
  }

  if (element.parentElement === null) {
    return false;
  }

  return isTreeScrollable(element.parentElement, direction);
};

interface IPullToRefresh {
  isPullable?: boolean;
  onRefresh?: () => Promise<any> | void;
  refreshingContent?: React.JSX.Element | string;
  pullingContent?: React.JSX.Element | string;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  resistance?: number;
  backgroundColor?: string;
  className?: string;
}

const PullToRefresh: React.FC<IPullToRefresh> = ({
  isPullable = true,
  onRefresh,
  refreshingContent = onRefresh ? <Spinner size={30} withText={false} /> : <></>,
  pullingContent = <></>,
  children,
  pullDownThreshold = 67,
  maxPullDownDistance = 95, // max distance to scroll to trigger refresh
  resistance = 2,
  backgroundColor,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const pullDownRef = useRef<HTMLDivElement>(null);
  let pullToRefreshThresholdBreached: boolean = false;
  let isDragging: boolean = false;
  let startY: number = 0;
  let currentY: number = 0;

  useEffect(() => {
    if (!isPullable || !childrenRef || !childrenRef.current) return;
    const childrenEl = childrenRef.current;
    childrenEl.addEventListener('touchstart', onTouchStart, { passive: true });
    childrenEl.addEventListener('mousedown', onTouchStart);
    childrenEl.addEventListener('touchmove', onTouchMove, { passive: false });
    childrenEl.addEventListener('mousemove', onTouchMove);
    childrenEl.addEventListener('touchend', onEnd);
    childrenEl.addEventListener('mouseup', onEnd);
    document.body.addEventListener('mouseleave', onEnd);

    return () => {
      childrenEl.removeEventListener('touchstart', onTouchStart);
      childrenEl.removeEventListener('mousedown', onTouchStart);
      childrenEl.removeEventListener('touchmove', onTouchMove);
      childrenEl.removeEventListener('mousemove', onTouchMove);
      childrenEl.removeEventListener('touchend', onEnd);
      childrenEl.removeEventListener('mouseup', onEnd);
      document.body.removeEventListener('mouseleave', onEnd);
    };
  }, [children, isPullable, onRefresh, pullDownThreshold, maxPullDownDistance]);

  const initContainer = (): void => {
    requestAnimationFrame(() => {
      /**
       * Reset Styles
       */
      if (childrenRef.current) {
        childrenRef.current.style.transform = 'unset';
      }
      if (pullDownRef.current) {
        pullDownRef.current.style.opacity = '0';
      }
      if (containerRef.current) {
        containerRef.current.classList.remove('ptr--pull-down-treshold-breached');
        containerRef.current.classList.remove('ptr--dragging');
        containerRef.current.classList.remove('ptr--fetch-more-treshold-breached');
      }

      if (pullToRefreshThresholdBreached) pullToRefreshThresholdBreached = false;
    });
  };

  const onTouchStart = (e: MouseEvent | TouchEvent): void => {
    isDragging = false;
    if (e instanceof MouseEvent) {
      startY = e.pageY;
    }
    if (window.TouchEvent && e instanceof TouchEvent) {
      startY = e.touches[0].pageY;
    }
    currentY = startY;
    // Check if element can be scrolled
    if (e.type === 'touchstart' && isTreeScrollable(e.target as HTMLElement, DIRECTION.UP)) {
      return;
    }
    // Top non visible so cancel
    if (childrenRef.current!.getBoundingClientRect().top < 0) {
      return;
    }
    isDragging = true;
  };

  const onTouchMove = (e: MouseEvent | TouchEvent): void => {
    if (!isDragging) {
      return;
    }

    if (window.TouchEvent && e instanceof TouchEvent) {
      currentY = e.touches[0].pageY;
    } else {
      currentY = (e as MouseEvent).pageY;
    }

    containerRef.current!.classList.add('ptr--dragging');

    if (currentY < startY) {
      isDragging = false;
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    const yDistanceMoved = Math.min((currentY - startY) / resistance, maxPullDownDistance);

    // Limit to trigger refresh has been breached
    if (yDistanceMoved >= pullDownThreshold) {
      isDragging = true;
      pullToRefreshThresholdBreached = true;
      containerRef.current!.classList.remove('ptr--dragging');
      containerRef.current!.classList.add('ptr--pull-down-treshold-breached');
    }

    // maxPullDownDistance breached, stop the animation
    if (yDistanceMoved >= maxPullDownDistance) {
      return;
    }
    pullDownRef.current!.style.opacity = (yDistanceMoved / 65).toString();
    childrenRef.current!.style.overflow = 'visible';
    childrenRef.current!.style.transform = `translate(0px, ${yDistanceMoved}px)`;
    pullDownRef.current!.style.visibility = 'visible';
  };

  const onEnd = (): void => {
    isDragging = false;
    startY = 0;
    currentY = 0;

    // Container has not been dragged enough, put it back to it's initial state
    if (!pullToRefreshThresholdBreached) {
      if (pullDownRef.current) pullDownRef.current.style.visibility = 'hidden';
      initContainer();
      return;
    }

    if (childrenRef.current) {
      childrenRef.current.style.overflow = 'visible';
      childrenRef.current.style.transform = `translate(0px, ${pullDownThreshold}px)`;
    }

    if (onRefresh) {
      const result = onRefresh();
      if (result instanceof Promise) {
        result.then(initContainer).catch(initContainer);
      } else {
        initContainer();
      }
    }
  };

  return (
    <div className={`ptr ${className}`} style={{ backgroundColor }} ref={containerRef}>
      <div className='ptr__pull-down' ref={pullDownRef}>
        <div className='ptr__loader ptr__pull-down--loading'>{refreshingContent}</div>
        <div className='ptr__pull-down--pull-more'>{pullingContent}</div>
      </div>
      <div className='ptr__children' ref={childrenRef}>
        {children}
      </div>
    </div>
  );
};

export { PullToRefresh as default };
