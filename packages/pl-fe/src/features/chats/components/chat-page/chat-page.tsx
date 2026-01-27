import { Outlet, useMatch } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import Stack from 'pl-fe/components/ui/stack';
import { chatsEmptyRoute } from 'pl-fe/features/ui/router';
import { useChats } from 'pl-fe/queries/chats';

import ChatPageSidebar from './components/chat-page-sidebar';

const ChatPage: React.FC = () => {
  const { chatsQuery: { data: chats } } = useChats();

  const isSidebarHidden = !useMatch({ from: chatsEmptyRoute.id, shouldThrow: false }) || chats?.length === 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>('100%');

  const calculateHeight = () => {
    if (!containerRef.current) {
      return null;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const fullHeight = document.body.offsetHeight;

    // On mobile, account for bottom navigation.
    const offset = document.body.clientWidth < 976 ? -53 : 0;

    setHeight(fullHeight - top + offset);
  };

  useLayoutEffect(() => {
    calculateHeight();
  }, [containerRef.current]);

  useEffect(() => {
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className='h-screen overflow-hidden bg-white text-gray-900 shadow-lg black:bg-transparent dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:rounded-t-xl'
    >
      <div
        className='grid h-full grid-cols-9 overflow-hidden black:divide-gray-800 dark:divide-solid dark:divide-primary-800 sm:black:divide-x sm:dark:divide-x-2'
        data-testid='chat-page'
      >
        <Stack
          className={clsx('dark:inset col-span-9 overflow-hidden bg-gradient-to-r from-white to-gray-100 black:bg-black dark:bg-gray-900 dark:bg-none sm:col-span-3', {
            'hidden sm:block': isSidebarHidden,
          })}
        >
          <ChatPageSidebar />
        </Stack>

        <Stack
          className={clsx('col-span-9 h-full overflow-hidden sm:col-span-6', {
            'hidden sm:block': !isSidebarHidden,
          })}
        >
          <Outlet />
        </Stack>
      </div>
    </div>
  );
};

export { ChatPage as default };
