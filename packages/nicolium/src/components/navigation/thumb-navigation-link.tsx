import { Link, useMatchRoute, type LinkOptions } from '@tanstack/react-router';
import React from 'react';

import IconWithCounter from '@/components/icon-with-counter';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

interface IThumbNavigationLink extends LinkOptions {
  count?: number;
  countMax?: number;
  icon: string;
  activeIcon?: string;
  emoji?: string;
  emojiUrl?: string;
  text: string;
  exact?: boolean;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({
  count,
  countMax,
  icon,
  activeIcon,
  emoji,
  emojiUrl,
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
      className='thumb-navigation__item'
      activeProps={{ className: 'thumb-navigation__item--active' }}
      title={text}
    >
      {emoji || emojiUrl ? (
        <Emoji className='thumb-navigation__emoji' emoji={emoji} src={emojiUrl} alt='' />
      ) : demetricator === 'off' && count !== undefined ? (
        <IconWithCounter src={iconSrc} count={count} countMax={countMax} />
      ) : (
        <Icon src={iconSrc} />
      )}
    </Link>
  );
};

export { ThumbNavigationLink as default, type IThumbNavigationLink };
