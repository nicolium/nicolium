import { Link as Comp, type LinkProps } from '@tanstack/react-router';
import React from 'react';

const Link = (props: LinkProps & React.HTMLAttributes<HTMLAnchorElement>) => (
  <Comp {...props} className='mention' />
);

export { Link as default, Link };
