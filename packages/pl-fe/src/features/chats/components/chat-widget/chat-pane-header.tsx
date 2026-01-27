import React, { HTMLAttributes } from 'react';

import IconButton from 'pl-fe/components/ui/icon-button';
import { useSettings } from 'pl-fe/stores/settings';

interface IChatPaneHeader {
  isOpen: boolean;
  isToggleable?: boolean;
  onToggle(): void;
  title: string | React.ReactNode;
  unreadCount?: number;
  secondaryAction?(): void;
  secondaryActionIcon?: string;
}

const ChatPaneHeader = (props: IChatPaneHeader) => {
  const {
    isOpen,
    isToggleable = true,
    onToggle,
    secondaryAction,
    secondaryActionIcon,
    title,
    unreadCount,
    ...rest
  } = props;

  const { demetricator } = useSettings();

  const ButtonComp = isToggleable ? 'button' : 'div';
  const buttonProps: HTMLAttributes<HTMLButtonElement | HTMLDivElement> = {};
  if (isToggleable) {
    buttonProps.onClick = onToggle;
  }

  return (
    <div {...rest} className='⁂-chat-widget__header'>
      <ButtonComp
        className='⁂-chat-widget__header__title'
        data-testid='title'
        {...buttonProps}
      >
        <div>{title}</div>

        {(!demetricator && unreadCount !== undefined && unreadCount > 0) && (
          <div className='⁂-chat-widget__header__count'>
            <p data-testid='unread-count'>
              ({unreadCount})
            </p>

            <div className='⁂-chat-widget__header__count__dot' />
          </div>
        )}
      </ButtonComp>

      <div className='⁂-chat-widget__header__actions'>
        {secondaryAction ? (
          <IconButton
            onClick={secondaryAction}
            src={secondaryActionIcon as string}
          />
        ) : null}

        <IconButton
          onClick={onToggle}
          src={require('@phosphor-icons/core/regular/caret-up.svg')}
          className='⁂-chat-widget__header__open-button'
        />
      </div>
    </div>
  );
};

export { ChatPaneHeader as default };
