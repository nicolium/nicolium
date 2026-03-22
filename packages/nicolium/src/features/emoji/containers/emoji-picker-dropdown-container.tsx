import { useFloating, shift, flip, autoUpdate } from '@floating-ui/react';
import iconSmiley from '@phosphor-icons/core/regular/smiley.svg';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from '@/components/ui/icon-button';
import Portal from '@/components/ui/portal';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useTransitionStyles } from '@/hooks/use-transition-styles';

import EmojiPickerDropdown, {
  type IEmojiPickerDropdown,
} from '../components/emoji-picker-dropdown';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IEmojiPickerDropdownContainer extends Pick<
  IEmojiPickerDropdown,
  'onPickEmoji' | 'condensed' | 'withCustom'
> {
  children?: React.JSX.Element;
  theme?: 'default' | 'inverse';
}

const EmojiPickerDropdownContainer: React.FC<IEmojiPickerDropdownContainer> = ({
  theme = 'default',
  children,
  ...props
}) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { x, y, strategy, refs, update, context, placement } = useFloating<HTMLButtonElement>({
    open: isOpen,
    middleware: [flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  useClickOutside(refs, () => {
    setIsOpen(false);
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (['Enter', ' '].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const clonedChildren = useMemo(
    () =>
      children
        ? React.cloneElement(children, {
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            ref: refs.setReference,
          })
        : null,
    [children],
  );

  return (
    <div className='relative'>
      {clonedChildren ?? (
        <IconButton
          theme='transparent'
          className={clsx('emoji-picker-dropdown -m-1 p-2', {
            'bg-transparent text-gray-600 hover:bg-primary-100 hover:text-gray-800 black:hover:bg-gray-800 dark:hover:bg-primary-800 dark:hover:text-white':
              theme === 'default',
            'bg-transparent text-white/80 hover:text-white dark:bg-transparent':
              theme === 'inverse',
          })}
          ref={refs.setReference}
          src={iconSmiley}
          title={title}
          aria-label={title}
          aria-expanded={isOpen}
          role='button'
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        />
      )}

      {isMounted && (
        <Portal>
          <div
            className='z-[101]'
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
              ...styles,
            }}
          >
            <EmojiPickerDropdown visible setVisible={setIsOpen} update={update} {...props} />
          </div>
        </Portal>
      )}
    </div>
  );
};

export { messages, EmojiPickerDropdownContainer as default };
