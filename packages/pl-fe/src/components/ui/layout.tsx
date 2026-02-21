import clsx from 'clsx';
import React, { Suspense, useEffect, useState } from 'react';
import StickyBox from 'react-sticky-box';

import { useFeatures } from '@/hooks/use-features';

import tailwindConfig from '../../../tailwind.config';

const breakpoints = (tailwindConfig.theme?.screens as Record<string, string>) ?? {
  lg: '976px',
  xl: '1280px',
};

interface ISidebar {
  children: React.ReactNode;
  shrink?: boolean;
}
interface IAside {
  children?: React.ReactNode;
}

interface ILayout {
  children: React.ReactNode;
  fullWidth?: boolean;
}

interface LayoutComponent extends React.FC<ILayout> {
  Sidebar: React.FC<ISidebar>;
  Main: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Aside: React.FC<IAside>;
}

const useMinWidth = (query: string) => {
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, [query]);

  return matches;
};

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout: LayoutComponent = ({ children, fullWidth }) => (
  <div className='⁂-layout'>
    <div
      className={clsx('⁂-layout__content', {
        '⁂-layout__content--full-width': fullWidth,
      })}
    >
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar: React.FC<ISidebar> = ({ children, shrink }) => {
  const isVisible = useMinWidth(`(min-width: ${breakpoints.lg})`);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={clsx('⁂-layout__sidebar', { '⁂-layout__sidebar--shrink': shrink })}>
      <StickyBox offsetTop={16} className='⁂-layout__sidebar__content'>
        {children}
      </StickyBox>
    </div>
  );
};

/** Center column container in the UI. */
const Main: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className }) => {
  const features = useFeatures();

  return (
    <main
      className={clsx(
        {
          '⁂-layout__main': true,
          '⁂-layout__main--chats': features.chats,
        },
        className,
      )}
    >
      {children}
    </main>
  );
};

/** Right sidebar container in the UI. */
const Aside: React.FC<IAside> = ({ children }) => {
  const isVisible = useMinWidth(`(min-width: ${breakpoints.xl})`);

  if (!isVisible) {
    return null;
  }

  return (
    <aside className='⁂-layout__aside'>
      <StickyBox offsetTop={16} className='⁂-layout__aside__content'>
        <Suspense>{children}</Suspense>
      </StickyBox>
    </aside>
  );
};

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export { Layout as default };
