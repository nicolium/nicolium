import { Outlet } from '@tanstack/react-router';
import React from 'react';

/** Custom layout for chats on desktop. */
const ChatsLayout = () => (
  <div className='grow black:border-gray-800 md:col-span-12 lg:col-span-9 lg:black:border-l'>
    <Outlet />
  </div>
);

export { ChatsLayout as default };
