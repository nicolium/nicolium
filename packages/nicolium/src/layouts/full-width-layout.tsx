import { Outlet } from '@tanstack/react-router';
import React from 'react';

const FullWidthLayout: React.FC = () => (
  <div className='layout__full-width'>
    <Outlet />
  </div>
);

export { FullWidthLayout as default };
