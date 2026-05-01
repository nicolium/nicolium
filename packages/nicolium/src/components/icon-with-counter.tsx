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
  <div className='relative'>
    <Icon id={icon} {...rest} />

    {count > 0 && (
      <span className='absolute -right-3 -top-2'>
        <Counter count={count} countMax={countMax} />
      </span>
    )}
  </div>
);

export { IconWithCounter as default };
