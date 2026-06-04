import React from 'react';

import Counter from '@/components/ui/counter';
import Icon from '@/components/ui/icon';

interface IIconWithCounter extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  countMax?: number;
  icon?: string;
  src: string;
}

const IconWithCounter: React.FC<IIconWithCounter> = ({ icon, count, countMax, ...rest }) => (
  <div className='icon-with-counter'>
    <Icon id={icon} {...rest} />

    {count > 0 && (
      <span className='icon-with-counter__counter'>
        <Counter count={count} countMax={countMax} />
      </span>
    )}
  </div>
);

export { IconWithCounter as default };
