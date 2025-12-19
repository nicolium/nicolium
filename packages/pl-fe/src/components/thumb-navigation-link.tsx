import { Link, useMatchRoute } from '@tanstack/react-router';
import React from 'react';

import IconWithCounter from 'pl-fe/components/icon-with-counter';
import Icon from 'pl-fe/components/ui/icon';
import { useSettings } from 'pl-fe/stores/settings';

interface IThumbNavigationLink {
  count?: number;
  countMax?: number;
  src: string;
  activeSrc?: string;
  text: string;
  to: string;
  exact?: boolean;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({ count, countMax, src, activeSrc, text, to, exact }): JSX.Element => {
  const { demetricator } = useSettings();

  const matchRoute = useMatchRoute();

  const icon = (activeSrc && matchRoute({ to }) !== null && activeSrc) || src;

  return (
    <Link to={to} activeOptions={{ exact }} className='⁂-thumb-navigation__item' activeProps={{ className: '⁂-thumb-navigation__item--active' }} title={text}>
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
