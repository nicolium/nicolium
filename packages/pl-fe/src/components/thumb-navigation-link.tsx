import { Link, useMatchRoute, type LinkOptions } from '@tanstack/react-router';
import React from 'react';

import IconWithCounter from '@/components/icon-with-counter';
import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

interface IThumbNavigationLink extends LinkOptions {
  count?: number;
  countMax?: number;
  src: string;
  activeSrc?: string;
  text: string;
  exact?: boolean;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({ count, countMax, src, activeSrc, text, exact, ...props }): JSX.Element => {
  const { demetricator } = useSettings();

  const matchRoute = useMatchRoute();

  const icon = (activeSrc && matchRoute({ to: props.to, params: props.params, search: props.search }) !== false && activeSrc) ?? src;

  return (
    <Link {...props} activeOptions={{ exact }} className='⁂-thumb-navigation__item' activeProps={{ className: '⁂-thumb-navigation__item--active' }} title={text}>
      {!demetricator && count !== undefined ? (
        <IconWithCounter
          src={icon}
          count={count}
          countMax={countMax}
        />
      ) : (
        <Icon src={icon} />
      )}
    </Link>
  );
};

export { ThumbNavigationLink as default };
