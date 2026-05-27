import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useLocale, useLocaleDirection } from '@/hooks/use-locale';
import { getTextDirection } from '@/utils/rtl';

import Icon from './icon';
import SvgIcon from './svg-icon';
import Tooltip from './tooltip';

const messages = defineMessages({
  showPassword: { id: 'input.password.show_password', defaultMessage: 'Show password' },
  hidePassword: { id: 'input.password.hide_password', defaultMessage: 'Hide password' },
});

/** Possible theme names for an Input. */
type InputThemes = 'normal' | 'search' | 'transparent';

interface IInput extends Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'maxLength'
  | 'onChange'
  | 'onBlur'
  | 'type'
  | 'autoComplete'
  | 'autoCorrect'
  | 'autoCapitalize'
  | 'required'
  | 'disabled'
  | 'onClick'
  | 'readOnly'
  | 'min'
  | 'pattern'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onFocus'
  | 'onMouseDown'
  | 'style'
  | 'id'
  | 'lang'
  | 'title'
> {
  /** Put the cursor into the input on mount. */
  autoFocus?: boolean;
  /** The initial text in the input. */
  defaultValue?: string;
  /** Extra class names for the <input> element. */
  className?: string;
  /** Extra class names for the outer <div> element. */
  outerClassName?: string;
  /** URL to the svg icon. Cannot be used with prepend. */
  icon?: string;
  /** Internal input name. */
  name?: string;
  /** Text to display before a value is entered. */
  placeholder?: string;
  /** Text in the input. */
  value?: string | number;
  /** Change event handler for the input. */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** An element to display as prefix to input. Cannot be used with icon. */
  prepend?: React.ReactElement;
  /** An element to display as suffix to input. Cannot be used with password type. */
  append?: React.ReactElement;
  /** Theme to style the input with. */
  theme?: InputThemes;
}

/** Form input element. */
const Input = React.forwardRef<HTMLInputElement, IInput>((props, ref) => {
  const intl = useIntl();
  const direction = useLocaleDirection(useLocale());

  const {
    type = 'text',
    icon,
    className,
    outerClassName,
    append,
    prepend,
    theme = 'normal',
    ...filteredProps
  } = props;

  const [revealed, setRevealed] = React.useState(false);

  const isPassword = type === 'password';

  const togglePassword = React.useCallback(() => {
    setRevealed((prev) => !prev);
  }, []);

  return (
    <div className={clsx('input__wrapper', `input__wrapper--${theme}`, outerClassName)}>
      {icon ? (
        <div className='input__wrapper__icon'>
          <Icon src={icon} aria-hidden='true' />
        </div>
      ) : null}

      {prepend ? <div className='input__wrapper__prepend'>{prepend}</div> : null}

      <input
        {...filteredProps}
        type={revealed ? 'text' : type}
        ref={ref}
        className={clsx(
          'input',
          `input--${theme}`,
          {
            'input--with-icon': typeof icon !== 'undefined',
            'input--with-prepend': typeof prepend !== 'undefined',
            'input--with-trailing': isPassword || !!append,
          },
          className,
        )}
        dir={
          typeof props.value === 'string'
            ? getTextDirection(props.value, { fallback: direction })
            : undefined
        }
      />

      {append ? <div className='input__wrapper__append'>{append}</div> : null}

      {isPassword ? (
        <Tooltip
          text={
            revealed
              ? intl.formatMessage(messages.hidePassword)
              : intl.formatMessage(messages.showPassword)
          }
        >
          <div className='input__wrapper__password-toggle'>
            <button type='button' onClick={togglePassword} tabIndex={-1}>
              <SvgIcon src={revealed ? iconEyeSlash : iconEye} className='size-4' />
            </button>
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export { Input as default, InputThemes };
