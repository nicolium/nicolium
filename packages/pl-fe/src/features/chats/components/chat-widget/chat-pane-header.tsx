import React, { HTMLAttributes } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from '@/components/ui/icon-button';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  expand: { id: 'chat_pane.header.expand', defaultMessage: 'Expand chats' },
  collapse: { id: 'chat_pane.header.collapse', defaultMessage: 'Collapse chats' },
});

interface IChatPaneHeader {
  isOpen: boolean;
  isToggleable?: boolean;
  onToggle(): void;
  title: string | React.ReactNode;
  unreadCount?: number;
  secondaryAction?(): void;
  secondaryActionIcon?: string;
  secondaryActionTitle?: string;
}

const ChatPaneHeader = (props: IChatPaneHeader) => {
  const {
    isOpen,
    isToggleable = true,
    onToggle,
    secondaryAction,
    secondaryActionIcon,
    secondaryActionTitle,
    title,
    unreadCount,
    ...rest
  } = props;

  const intl = useIntl();
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
        {secondaryAction && secondaryActionIcon ? (
          <IconButton
            onClick={secondaryAction}
            src={secondaryActionIcon}
            title={secondaryActionTitle}
          />
        ) : null}

        <IconButton
          onClick={onToggle}
          src={require('@phosphor-icons/core/regular/caret-up.svg')}
          className='⁂-chat-widget__header__open-button'
          title={isOpen ? intl.formatMessage(messages.collapse) : intl.formatMessage(messages.expand)}
        />
      </div>
    </div>
  );
};

export { ChatPaneHeader as default };
