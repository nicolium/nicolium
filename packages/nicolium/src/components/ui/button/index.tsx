import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';

import Icon from '../icon';

import { useButtonStyles } from './useButtonStyles';

import type { ButtonSizes, ButtonThemes } from './useButtonStyles';

type IButton = Pick<
  React.ComponentProps<'button'>,
  'children' | 'className' | 'disabled' | 'title' | 'type'
> &
  (LinkOptions | { to?: undefined }) & {
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
    /** Makes the button into an anchor, if provided. */
    href?: string;
    /** Styles the button visually with a predefined theme. */
    theme?: ButtonThemes;
    /** Event handler for click events. */
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    /** Event handler for mouse down events. */
    onMouseDown?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    /** Event handler for key down events. */
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    /** Event handler for key press events. */
    onKeyPress?: React.KeyboardEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  };

/** Customizable button element with various themes. */
const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IButton>(
  (
    {
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
      href,
      type = 'button',
      className,
      ...props
    },
    ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
  ): React.JSX.Element => {
    const body = text ?? children;

    const themeClass = useButtonStyles({
      theme,
      block,
      size,
    });

    const handleClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> =
      React.useCallback(
        (event) => {
          if (onClick && !disabled) {
            onClick(event);
          }
        },
        [onClick, disabled],
      );

    const buttonChildren = (
      <>
        {icon ? <Icon src={icon} className={clsx('size-4', iconClassName)} aria-hidden /> : null}

        {body && <span>{body}</span>}

        {secondaryIcon ? <Icon src={secondaryIcon} className='size-4' aria-hidden /> : null}
      </>
    );

    const renderButton = () => (
      <button
        {...props}
        className={clsx(themeClass, className)}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        disabled={disabled}
        onClick={handleClick}
        type={type}
        data-testid='button'
      >
        {buttonChildren}
      </button>
    );

    if (props.to) {
      return (
        <Link
          {...props}
          className={clsx(themeClass, className)}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          to={props.to}
          params={props.params}
          search={props.search}
          tabIndex={-1}
        >
          {buttonChildren}
        </Link>
      );
    }

    if (href) {
      return (
        <a
          {...props}
          className={clsx(themeClass, className)}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
        >
          {buttonChildren}
        </a>
      );
    }

    return renderButton();
  },
);

Button.displayName = 'Button';

export { Button as default };
