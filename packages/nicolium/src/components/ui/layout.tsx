import clsx from 'clsx';
import debounce from 'lodash/debounce';
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

interface WindowControlsOverlay extends EventTarget {
  visible: boolean;
  getTitlebarAreaRect(): DOMRect;
}

declare global {
  interface Navigator {
    windowControlsOverlay?: WindowControlsOverlay;
  }
}

const useWindowControlsOverlay = () => {
  const getRect = (): DOMRect | null => {
    const overlay = navigator.windowControlsOverlay;
    return overlay?.visible ? overlay.getTitlebarAreaRect() : null;
  };

  const [rect, setRect] = useState<DOMRect | null>(getRect);

  useEffect(() => {
    const overlay = navigator.windowControlsOverlay;
    if (!overlay) return;

    const update = debounce(
      () => setRect(overlay.visible ? overlay.getTitlebarAreaRect() : null),
      100,
    );
    overlay.addEventListener('geometrychange', update);
    return () => {
      overlay.removeEventListener('geometrychange', update);
      update.cancel();
    };
  }, []);

  return rect;
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
  const wcoRect = useWindowControlsOverlay();
  const offsetTop = wcoRect && wcoRect.x > 0 ? 16 + wcoRect.y : 16;

  if (!isVisible) {
    return null;
  }

  return (
    <div className={clsx('⁂-layout__sidebar', { '⁂-layout__sidebar--shrink': shrink })}>
      <StickyBox offsetTop={offsetTop} className='⁂-layout__sidebar__content'>
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
  const wcoRect = useWindowControlsOverlay();
  const offsetTop =
    wcoRect && wcoRect.x + wcoRect.width < window.innerWidth ? 16 + wcoRect.height : 16;

  if (!isVisible) {
    return null;
  }

  return (
    <aside className='⁂-layout__aside'>
      <StickyBox offsetTop={offsetTop} className='⁂-layout__aside__content'>
        <Suspense>{children}</Suspense>
      </StickyBox>
    </aside>
  );
};

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export { Layout as default };
