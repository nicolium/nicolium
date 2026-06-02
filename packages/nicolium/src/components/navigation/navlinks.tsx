import { Link } from '@tanstack/react-router';
import React from 'react';

import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useSettings } from '@/stores/settings';

interface INavlinks {
  type: string;
}

const Navlinks: React.FC<INavlinks> = ({ type }) => {
  const { locale } = useSettings();
  const { copyright, navlinks } = useFrontendConfig();

  return (
    <footer className='navlinks'>
      <ul>
        {navlinks[type]?.map((link) => {
          const url = link.url;
          const isExternal = url.startsWith('http');
          const Comp = (isExternal ? 'a' : Link) as 'a';
          const compProps = isExternal ? { href: url, target: '_blank' } : { to: url };

          return (
            <li key={link.url}>
              <Comp {...compProps}>{link.titleLocales[locale] || link.title}</Comp>
            </li>
          );
        })}
      </ul>

      {copyright && <p className='navlinks__copyright'>{copyright}</p>}
    </footer>
  );
};

export { Navlinks };
