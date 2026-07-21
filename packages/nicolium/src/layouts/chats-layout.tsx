import { Outlet } from '@tanstack/react-router';
import React from 'react';

/** Custom layout for chats on desktop. */
const ChatsLayout: React.FC = () => (
  <div className='layout__chats'>
    <Outlet />
  </div>
);

export { ChatsLayout as default };
