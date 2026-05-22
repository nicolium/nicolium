import clsx from 'clsx';
import React from 'react';

import Popover from '@/components/ui/popover';

import AltIndicator from './alt-indicator';

interface IAltPopover {
  alt: string;
  heading: React.ReactNode;
  message?: React.JSX.Element;
  title?: string;
  className?: string;
}

const AltPopover: React.FC<IAltPopover> = ({ alt, heading, message, title, className }) => (
  <Popover
    interaction='click'
    content={
      <div className='⁂-alt-popover'>
        <p className='⁂-alt-popover__title'>{heading}</p>
        <p className='⁂-alt-popover__text'>{alt}</p>
      </div>
    }
    isFlush
    title={title}
  >
    <AltIndicator className={clsx(className, '⁂-alt-popover__reference')} message={message} />
  </Popover>
);

export { AltPopover as default };
