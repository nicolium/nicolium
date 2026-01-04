import { Link, type LinkProps } from '@tanstack/react-router';
import React, { useRef } from 'react';

import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { ChatWidgetScreens, useChatContext } from 'pl-fe/contexts/chat-context';

import Chat from '../chat';

import ChatPaneHeader from './chat-pane-header';
import ChatSettings from './chat-settings';

const LinkWrapper = ({ enabled, children, ...rest }: LinkProps & { enabled: boolean; children: React.ReactNode }): JSX.Element => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Link {...rest}>
      {children}
    </Link>
  );
};

/** Floating desktop chat window. */
const ChatWindow = () => {
  const { chat, currentChatId, screen, changeScreen, isOpen, toggleChatPane } = useChatContext();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const closeChat = () => {
    changeScreen(ChatWidgetScreens.INBOX);
  };

  const openSearch = () => {
    toggleChatPane();
    changeScreen(ChatWidgetScreens.SEARCH);
  };

  const openChatSettings = () => {
    changeScreen(ChatWidgetScreens.CHAT_SETTINGS, currentChatId);
  };

  const secondaryAction = () => isOpen ? openChatSettings : openSearch;

  if (!chat) return null;

  if (screen === ChatWidgetScreens.CHAT_SETTINGS) {
    return <ChatSettings />;
  }

  return (
    <>
      <ChatPaneHeader
        title={
          <HStack alignItems='center' space={2}>
            {isOpen && (
              <button onClick={closeChat}>
                <Icon
                  src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                  className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
                />
              </button>
            )}

            <HStack alignItems='center' space={3}>
              {isOpen && (
                <Link to='/@{$username}' params={{ username: chat.account.acct }}>
                  <Avatar src={chat.account.avatar} alt={chat.account.avatar_description} size={40} isCat={chat.account.is_cat} username={chat.account.username} />
                </Link>
              )}

              <Stack alignItems='start'>
                <LinkWrapper enabled={isOpen} to='/@{$username}' params={{ username: chat.account.acct }}>
                  <div className='flex grow items-center space-x-1'>
                    <Text size='sm' weight='bold' truncate>{chat.account.display_name || `@${chat.account.acct}`}</Text>
                    {chat.account.verified && <VerificationBadge />}
                  </div>
                </LinkWrapper>
              </Stack>
            </HStack>
          </HStack>
        }
        secondaryAction={secondaryAction()}
        secondaryActionIcon={isOpen ? require('@phosphor-icons/core/regular/info.svg') : require('@phosphor-icons/core/regular/pencil-simple.svg')}
        isToggleable={!isOpen}
        isOpen={isOpen}
        onToggle={toggleChatPane}
      />

      <Stack className='h-full grow overflow-hidden' space={2}>
        <Chat chat={chat} inputRef={inputRef} />
      </Stack>
    </>
  );
};

export { ChatWindow as default };
