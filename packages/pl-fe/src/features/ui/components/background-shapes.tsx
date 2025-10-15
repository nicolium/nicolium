import clsx from 'clsx';
import React from 'react';

interface IBackgroundShapes {
  /** Whether the shapes should be absolute positioned or fixed. */
  position?: 'fixed' | 'absolute';
  /** Override visibility. */
  hidden?: boolean;
}

/** Gradient that appears in the background of the UI. */
const BackgroundShapes: React.FC<IBackgroundShapes> = ({ position = 'fixed', hidden }) => hidden ? null : (
  <div
    className={clsx(position, 'pointer-events-none inset-x-0 top-0 flex justify-center overflow-hidden ', {
      'black:hidden': hidden === undefined,
    })}
  >
    <div className='bg-gradient-sm lg:bg-gradient-light lg:dark:bg-gradient-dark h-screen w-screen' />
  </div>
);

export { BackgroundShapes as default };
