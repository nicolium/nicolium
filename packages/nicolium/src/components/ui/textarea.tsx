import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useLocale, useLocaleDirection } from '@/hooks/use-locale';
import { getTextDirection } from '@/utils/rtl';

interface ITextarea extends Pick<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'className'
  | 'id'
  | 'lang'
  | 'maxLength'
  | 'onChange'
  | 'onClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onPaste'
  | 'required'
  | 'disabled'
  | 'rows'
  | 'readOnly'
> {
  /** Put the cursor into the input on mount. */
  autoFocus?: boolean;
  /** Allows the textarea height to grow while typing */
  autoGrow?: boolean;
  /** Used with "autoGrow". Sets a max number of rows. */
  maxRows?: number;
  /** Used with "autoGrow". Sets a min number of rows. */
  minRows?: number;
  /** The initial text in the input. */
  defaultValue?: string;
  /** Internal input name. */
  name?: string;
  /** Renders the textarea as a code editor. */
  isCodeEditor?: boolean;
  /** Text to display before a value is entered. */
  placeholder?: string;
  /** Text in the textarea. */
  value?: string;
  /** Whether the device should autocomplete text in this textarea. */
  autoComplete?: string;
  /** Whether to display the textarea in red. */
  hasError?: boolean;
  /** Whether or not you can resize the textarea */
  isResizeable?: boolean;
  /** Textarea theme. */
  theme?: 'default' | 'transparent';
}

/** Textarea with custom styles. */
const Textarea = React.forwardRef(
  (
    {
      isCodeEditor = false,
      hasError = false,
      isResizeable = true,
      onChange,
      autoGrow = false,
      maxRows = 10,
      minRows = 1,
      rows: initialRows = 4,
      theme = 'default',
      maxLength,
      value,
      className,
      ...props
    }: ITextarea,
    ref: React.ForwardedRef<HTMLTextAreaElement>,
  ) => {
    const length = value?.length ?? 0;
    const [rows, setRows] = useState<number>(autoGrow ? minRows : initialRows);
    const direction = useLocaleDirection(useLocale());

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow) {
        const textareaLineHeight = 20;
        const previousRows = event.target.rows;
        event.target.rows = minRows;

        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

        if (currentRows === previousRows) {
          event.target.rows = currentRows;
        }

        if (currentRows >= maxRows) {
          event.target.rows = maxRows;
          event.target.scrollTop = event.target.scrollHeight;
        }

        setRows(currentRows < maxRows ? currentRows : maxRows);
      }

      if (onChange) {
        onChange(event);
      }
    };

    const textarea = (
      <textarea
        {...props}
        value={value}
        ref={ref}
        rows={rows}
        onChange={handleChange}
        className={clsx(
          '⁂-textarea',
          {
            '⁂-textarea--transparent': theme === 'transparent',
            '⁂-textarea--mono': isCodeEditor,
            '⁂-textarea--has-error': hasError,
            '⁂-textarea--resizable': isResizeable,
          },
          className,
        )}
        dir={value?.length ? getTextDirection(value, { fallback: direction }) : undefined}
      />
    );

    if (!maxLength) {
      return textarea;
    }

    return (
      <div className='⁂-textarea__container'>
        {textarea}

        {maxLength && (
          <p
            className={clsx('⁂-textarea__max-length', {
              '⁂-textarea__max-length--exceeded': maxLength - length < 0,
            })}
          >
            <FormattedMessage
              id='textarea.counter.label'
              defaultMessage='{count} characters remaining'
              values={{ count: maxLength - length }}
            />
          </p>
        )}
      </div>
    );
  },
);

export { Textarea as default };
