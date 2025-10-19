import clsx from 'clsx';
import React, { Suspense } from 'react';
import StickyBox from 'react-sticky-box';

import { useFeatures } from 'pl-fe/hooks/use-features';

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

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout: LayoutComponent = ({ children, fullWidth }) => (
  <div className='⁂-layout'>
    <div
      className={clsx(
        '⁂-layout__content',
        {
          '⁂-layout__content--full-width': fullWidth,
        },
      )}
    >
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar: React.FC<ISidebar> = ({ children, shrink }) => (
  <div className={clsx('⁂-layout__sidebar', { '⁂-layout__sidebar--shrink': shrink })}>
    <StickyBox offsetTop={16} className='⁂-layout__sidebar__content'>
      {children}
    </StickyBox>
  </div>
);

/** Center column container in the UI. */
const Main: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className }) => {
  const features = useFeatures();

  return (
    <main
      className={clsx({
        '⁂-layout__main': true,
        '⁂-layout__main--chats': features.chats,
      }, className)}
    >
      {children}
    </main>
  );
};

/** Right sidebar container in the UI. */
const Aside: React.FC<IAside> = ({ children }) => (
  <aside className='⁂-layout__aside'>
    <StickyBox offsetTop={16} className='⁂-layout__aside__content'>
      <Suspense>
        {children}
      </Suspense>
    </StickyBox>
  </aside>
);

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export { Layout as default };
