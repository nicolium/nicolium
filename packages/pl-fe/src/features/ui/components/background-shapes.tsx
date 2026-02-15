import clsx from 'clsx';
import React from 'react';

interface IBackgroundShapes {
  /** Whether the shapes should be absolute positioned or fixed. */
  preview?: boolean;
  /** Override visibility. */
  hidden?: boolean;
}

/** Gradient that appears in the background of the UI. */
const BackgroundShapes: React.FC<IBackgroundShapes> = ({ preview, hidden }) =>
  hidden ? null : (
    <div className={clsx('⁂-background-shapes', preview && '⁂-background-shapes--preview')}>
      <div />
    </div>
  );

export { BackgroundShapes as default };
