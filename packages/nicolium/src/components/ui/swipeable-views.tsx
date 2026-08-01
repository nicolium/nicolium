import { useDrag } from '@use-gesture/react';
import React, { useLayoutEffect } from 'react';

const SWIPE_THRESHOLD = 40;

interface ISwipeableViews {
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** Index of the visible view. */
  index?: number;
  /** Callback when a swipe selects another view. */
  onChangeIndex?: (index: number) => void;
  /** Keep the container as tall as the visible view. */
  animateHeight?: boolean;
}

const SwipeableViews: React.FC<ISwipeableViews> = ({
  children,
  index = 0,
  onChangeIndex,
  animateHeight,
  style,
}) => {
  const count = React.Children.count(children);
  const activeRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>();
  const [offset, setOffset] = React.useState(0);

  useLayoutEffect(() => {
    const slide = activeRef.current;
    if (!animateHeight || !slide) return;

    const update = () => {
      setHeight(Math.max(slide.clientHeight, slide.getBoundingClientRect().height));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(slide);

    return () => observer.disconnect();
  }, [animateHeight, index, count]);

  const bind = useDrag(
    ({ active, movement: [movement] }) => {
      if (active) {
        setOffset(movement);
        return;
      }

      setOffset(0);

      if (Math.abs(movement) < SWIPE_THRESHOLD) return;

      const nextIndex = Math.min(Math.max(index + (movement < 0 ? 1 : -1), 0), count - 1);

      if (nextIndex !== index) onChangeIndex?.(nextIndex);
    },
    { axis: 'x', enabled: !!onChangeIndex, filterTaps: true },
  );

  return (
    <div
      className='swipeable-views'
      style={{ ...style, height: animateHeight ? height : undefined }}
      {...bind()}
    >
      <div
        className='swipeable-views__track'
        style={{
          transform: `translateX(calc(${-index * 100}% + ${offset}px))`,
          transition: offset ? 'none' : undefined,
        }}
      >
        {React.Children.map(children, (child, childIndex) => (
          <div
            className='swipeable-views__view'
            inert={childIndex !== index}
            ref={childIndex === index ? activeRef : undefined}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export { SwipeableViews as default };
