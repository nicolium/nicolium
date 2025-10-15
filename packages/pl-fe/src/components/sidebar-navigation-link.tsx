import clsx from 'clsx';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { useSettings } from 'pl-fe/hooks/use-settings';

import Icon from './ui/icon';

interface ISidebarNavigationLink {
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
  /** Route to an internal page. */
  to?: string;
  /** Callback when the link is clicked. */
  onClick?: React.EventHandler<React.MouseEvent>;
}

/** Desktop sidebar navigation link. */
const SidebarNavigationLink = React.memo(React.forwardRef((props: ISidebarNavigationLink, ref: React.ForwardedRef<HTMLAnchorElement>): JSX.Element => {
  const { icon, activeIcon, text, to = '', count, countMax, onClick } = props;
  const isActive = location.pathname === to;

  const { demetricator } = useSettings();

  const handleClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (onClick) {
      onClick(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <NavLink
      exact
      to={to}
      ref={ref}
      onClick={handleClick}
      className={clsx({
        '⁂-sidebar-navigation-link': true,
        '⁂-sidebar-navigation-link--active': isActive,
      })}
    >
      <span
        className='⁂-sidebar-navigation-link__icon'
      >
        <Icon
          src={(isActive && activeIcon) || icon}
          count={demetricator ? undefined : count}
          countMax={countMax}
        />
      </span>

      <p>{text}</p>
    </NavLink>
  );
}), (prevProps, nextProps) => prevProps.count === nextProps.count);

export { SidebarNavigationLink as default };
