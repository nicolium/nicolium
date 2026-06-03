import clsx from 'clsx';
import React from 'react';

import SvgIcon from './svg-icon';

interface IIconButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Class name for the <svg> icon. */
  iconClassName?: string;
  /** URL to the svg icon. */
  src: string;
  /** Text to display next to the button. */
  text?: string;
  /** Predefined styles to display for the button. */
  theme?: 'seamless' | 'outlined' | 'secondary' | 'transparent' | 'dark';
  /** Override the data-testid */
  'data-testid'?: string;
  /** URL address */
  href?: string;
}

/** A clickable icon. */
const IconButton = React.forwardRef(
  (props: IIconButton, ref: React.ForwardedRef<HTMLButtonElement>): React.JSX.Element => {
    const { src, className, iconClassName, text, theme = 'seamless', ...filteredProps } = props;

    const Component = (props.href ? 'a' : 'button') as 'button';

    return (
      <Component
        ref={ref}
        type='button'
        className={clsx('icon-button', `icon-button--${theme}`, className)}
        {...filteredProps}
        data-testid={filteredProps['data-testid'] ?? 'icon-button'}
        {...(props.href ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <SvgIcon src={src} className={iconClassName} aria-hidden />

        {text ? <span>{text}</span> : null}
      </Component>
    );
  },
);

IconButton.displayName = 'IconButton';

export { IconButton as default };
