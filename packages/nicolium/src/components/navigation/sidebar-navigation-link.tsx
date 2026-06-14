import { Link, useMatchRoute, type LinkOptions } from '@tanstack/react-router';
import React from 'react';

import { useSettings } from '@/stores/settings';

import Icon from '../ui/icon';

interface ISidebarNavigationLink extends Partial<LinkOptions> {
  /** Notification count, if any. */
  count?: number;
  /** Optional max to cap count (ie: N+) */
  countMax?: number;
  /** URL to an SVG icon. */
  icon: string;
  /** URL to an SVG icon for active state. */
  activeIcon?: string;
  /** Link label. */
  text: React.ReactNode;
  /** Callback when the link is clicked. */
  onClick?: React.EventHandler<React.MouseEvent>;
  rel?: string;
}

/** Desktop sidebar navigation link. */
const SidebarNavigationLink: React.FC<ISidebarNavigationLink> = React.memo(
  React.forwardRef((props, ref: React.ForwardedRef<HTMLAnchorElement>): React.JSX.Element => {
    const { icon, activeIcon, text, to, count, countMax, onClick, ...rest } = props;

    const matchRoute = useMatchRoute();
    const { demetricator } = useSettings();

    const LinkComponent = (rest.href ? 'a' : to === undefined ? 'button' : Link) as typeof Link;

    if (rest.href) {
      rest.target = '_blank';
      rest.rel = 'noopener noreferrer';
    }

    const isActive = matchRoute({ to, ...rest }) !== false;

    return (
      <LinkComponent
        activeOptions={{ exact: true, includeSearch: false }}
        activeProps={{ className: 'sidebar-navigation-link--active' }}
        to={to}
        ref={ref}
        onClick={onClick}
        className='sidebar-navigation-link'
        {...rest}
      >
        <span className='sidebar-navigation-link__icon' aria-hidden>
          <Icon
            src={(isActive && activeIcon) || icon}
            count={demetricator !== 'off' ? undefined : count}
            countMax={countMax}
          />
        </span>

        <p>{text}</p>
      </LinkComponent>
    );
  }),
  (prevProps, nextProps) =>
    prevProps.text === nextProps.text && prevProps.count === nextProps.count,
);

export { SidebarNavigationLink as default };
