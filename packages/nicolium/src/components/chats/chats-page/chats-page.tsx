import { Outlet, useMatch } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useChats } from '@/queries/chats';
import { chatsEmptyRoute } from '@/router';
import { useShoutboxIsLoading } from '@/stores/shoutbox';

import ChatsPageSidebar from './components/chats-page-sidebar';

const ChatsPage: React.FC = () => {
  const {
    chatsQuery: { data: chats },
  } = useChats();
  const showShoutbox = !useShoutboxIsLoading();

  const isSidebarHidden =
    !useMatch({ from: chatsEmptyRoute.id, shouldThrow: false }) ||
    (chats?.length === 0 && !showShoutbox);

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>('100%');

  const calculateHeight = () => {
    if (!containerRef.current) {
      return null;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const fullHeight = document.body.offsetHeight;

    // On mobile, account for bottom navigation.
    const offset = document.body.clientWidth < 581 ? -53 : 0;

    setHeight(fullHeight - top + offset);
  };

  useLayoutEffect(() => {
    calculateHeight();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height }} className='chats-page'>
      <div data-testid='chat-page'>
        <div
          className={clsx('chats-page__sidebar', {
            'chats-page__sidebar--hidden': isSidebarHidden,
          })}
        >
          <ChatsPageSidebar />
        </div>

        <div
          className={clsx('chats-page__main', {
            'chats-page__main--hidden': !isSidebarHidden,
          })}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export { ChatsPage as default };
