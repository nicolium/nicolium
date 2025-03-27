import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

import DropdownMenu from 'pl-fe/components/dropdown-menu';

import Icon from '../icon';

import { useButtonStyles } from './useButtonStyles';

import type { ButtonSizes, ButtonThemes } from './useButtonStyles';
import type { Menu } from 'pl-fe/components/dropdown-menu';

interface IButton extends Pick<
  React.ComponentProps<'button'>,
  'children' | 'className' | 'disabled' | 'onClick' | 'onMouseDown' | 'onKeyDown' | 'onKeyPress' | 'title' | 'type'
> {
  /** Whether this button expands the width of its container. */
  block?: boolean;
  /** URL to an SVG icon to render inside the button. */
  icon?: string;
  /** Class name to apply to the icon element inside the button. */
  iconClassName?: string;
  /** URL to an SVG icon to render inside the button next to the text. */
  secondaryIcon?: string;
  /** A predefined button size. */
  size?: ButtonSizes;
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode;
  /** Makes the button into a navlink, if provided. */
  to?: string;
  /** Makes the button into an anchor, if provided. */
  href?: string;
  /** Styles the button visually with a predefined theme. */
  theme?: ButtonThemes;
  /** Menu items to display as a secondary action. */
  actionsMenu?: Menu;
}

/** Customizable button element with various themes. */
const Button = React.forwardRef<HTMLButtonElement, IButton>(({
  block = false,
  children,
  disabled = false,
  icon,
  iconClassName,
  secondaryIcon,
  onClick,
  size = 'md',
  text,
  theme = 'secondary',
  to,
  href,
  type = 'button',
  className,
  actionsMenu,
  ...props
}, ref): JSX.Element => {
  const body = text || children;

  const { innerStyle, outerStyle } = useButtonStyles({
    theme,
    block,
    disabled,
    size,
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback((event) => {
    if (onClick && !disabled) {
      onClick(event);
    }
  }, [onClick, disabled]);

  const renderButton = () => (
    <button
      {...props}
      className={clsx('rtl:space-x-reverse', {
        [outerStyle]: !actionsMenu,
        [innerStyle]: true,
        [className || '']: true,
      })}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      type={type}
      data-testid='button'
    >
      {icon ? <Icon src={icon} className={clsx('size-4', iconClassName)} /> : null}

      {body && (
        <span>{body}</span>
      )}

      {secondaryIcon ? <Icon src={secondaryIcon} className='size-4' /> : null}
    </button>
  );

  let button = renderButton();

  if (to) {
    button = (
      <Link to={to} tabIndex={-1} className='inline-flex'>
        {button}
      </Link>
    );
  }

  if (href) {
    button = (
      <a href={href} target='_blank' rel='noopener' tabIndex={-1} className='inline-flex'>
        {button}
      </a>
    );
  }

  if (actionsMenu?.length) {
    button = (
      <div className={outerStyle}>
        {button}

        <div className='h-5 w-px bg-gray-200/50' />

        <DropdownMenu items={actionsMenu} placement='bottom'>
          <Icon src={require('@tabler/icons/filled/caret-down.svg')} className='size-4' />
        </DropdownMenu>
      </div>
    );
  }

  return button;
});

export { Button as default };
