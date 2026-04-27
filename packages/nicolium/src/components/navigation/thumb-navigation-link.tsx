import { Link, useMatchRoute, type LinkOptions } from '@tanstack/react-router';
import React from 'react';

import IconWithCounter from '@/components/icon-with-counter';
import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

interface IThumbNavigationLink extends LinkOptions {
  count?: number;
  countMax?: number;
  icon: string;
  activeIcon?: string;
  text: string;
  exact?: boolean;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({
  count,
  countMax,
  icon,
  activeIcon,
  text,
  exact,
  ...props
}): React.JSX.Element => {
  const { demetricator } = useSettings();

  const matchRoute = useMatchRoute();

  const iconSrc =
    (activeIcon &&
      matchRoute({ to: props.to, params: props.params, search: props.search }) !== false &&
      activeIcon) ||
    icon;

  return (
    <Link
      {...props}
      activeOptions={{ exact }}
      className='⁂-thumb-navigation__item'
      activeProps={{ className: '⁂-thumb-navigation__item--active' }}
      title={text}
    >
      {!demetricator && count !== undefined ? (
        <IconWithCounter src={iconSrc} count={count} countMax={countMax} />
      ) : (
        <Icon src={iconSrc} />
      )}
    </Link>
  );
};

export { ThumbNavigationLink as default, type IThumbNavigationLink };
