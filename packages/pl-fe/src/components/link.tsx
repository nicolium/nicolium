import { Link as Comp, type LinkProps } from '@tanstack/react-router';
import React from 'react';

const Link = (props: LinkProps) => (
  <Comp
    {...props}
    className='text-primary-600 hover:underline dark:text-accent-blue'
  />
);

export { Link as default };
