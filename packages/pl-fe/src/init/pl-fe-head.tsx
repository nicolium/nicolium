import clsx from 'clsx';
import React, { useEffect, useMemo } from 'react';

import InlineStyle from '@/components/inline-style';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLocale, useLocaleDirection } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { useThemeCss } from '@/hooks/use-theme-css';
import { startSentry } from '@/sentry';
import { useHasModals } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

const Helmet = React.lazy(() => import('@/components/helmet'));

/** Injects metadata into site head with Helmet. */
const PlFeHead = () => {
  const locale = useLocale();
  const direction = useLocaleDirection(locale);
  const {
    reduceMotion,
    underlineLinks,
    demetricator,
    systemFont,
    theme: themeSettings,
  } = useSettings();
  const frontendConfig = useFrontendConfig();
  const theme = useTheme();
  const [wcoVisible, setWcoVisible] = React.useState(false);
  const [wcoRight, setWcoRight] = React.useState(false);

  const withModals = useHasModals();

  const themeCss = useThemeCss();
  const dsn = frontendConfig.sentryDsn;

  const bodyClass = clsx({
    'no-reduce-motion': !reduceMotion,
    'underline-links': underlineLinks,
    demetricator: demetricator,
    'system-font': systemFont,
    'with-modals': withModals,
  });

  useEffect(() => {
    if (dsn) {
      startSentry(dsn).catch(console.error);
    }
  }, [dsn]);

  useEffect(() => {
    const overlay = navigator.windowControlsOverlay;
    if (!overlay) return;

    const update = () => {
      setWcoVisible(overlay.visible);
      if (overlay.visible) {
        const rect = overlay.getTitlebarAreaRect();
        setWcoRight(rect.x + rect.width < window.innerWidth);
      } else {
        setWcoRight(false);
      }
    };
    update();
    overlay.addEventListener('geometrychange', update);
    return () => overlay.removeEventListener('geometrychange', update);
  }, []);

  const color = useMemo(() => {
    if (wcoVisible) {
      return window.getComputedStyle(document.body, null).getPropertyValue('background-color');
    }
    return frontendConfig.brandColor;
  }, [frontendConfig.brandColor, theme, wcoVisible, wcoRight]);

  return (
    <>
      <Helmet>
        <html
          lang={locale}
          className={clsx(`text-${themeSettings?.interfaceSize ?? 'md'}`, {
            dark: theme === 'dark',
            'black dark': theme === 'black',
            'window-controls-overlay': wcoVisible,
            'window-controls-overlay--right': wcoRight,
          })}
        />
        <body className={bodyClass} dir={direction} />
        <meta name='theme-color' content={color} />
      </Helmet>
      <InlineStyle>{`:root { ${themeCss} }`}</InlineStyle>
      {['dark', 'black'].includes(theme) && (
        <InlineStyle>{':root { color-scheme: dark; }'}</InlineStyle>
      )}
    </>
  );
};

export { PlFeHead as default };
