import clsx from 'clsx';
import React, { useEffect } from 'react';

import InlineStyle from 'pl-fe/components/inline-style';
import { useLocale, useLocaleDirection } from 'pl-fe/hooks/use-locale';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useTheme } from 'pl-fe/hooks/use-theme';
import { useThemeCss } from 'pl-fe/hooks/use-theme-css';
import { startSentry } from 'pl-fe/sentry';
import { useModalsStore } from 'pl-fe/stores/modals';

const Helmet = React.lazy(() => import('pl-fe/components/helmet'));

/** Injects metadata into site head with Helmet. */
const PlFeHead = () => {
  const locale = useLocale();
  const direction = useLocaleDirection(locale);
  const { reduceMotion, underlineLinks, demetricator, systemFont, theme: themeSettings } = useSettings();
  const plFeConfig = usePlFeConfig();
  const theme = useTheme();

  const withModals = useModalsStore().modals.length > 0;

  const themeCss = useThemeCss();
  const dsn = plFeConfig.sentryDsn;

  const bodyClass = clsx({
    'no-reduce-motion': !reduceMotion,
    'underline-links': underlineLinks,
    'demetricator': demetricator,
    'system-font': systemFont,
    'with-modals': withModals,
  });

  useEffect(() => {
    if (dsn) {
      startSentry(dsn).catch(console.error);
    }
  }, [dsn]);

  return (
    <>
      <Helmet>
        <html
          lang={locale}
          className={clsx(`text-${themeSettings?.interfaceSize || 'md'}`, {
            'dark': theme === 'dark',
            'dark black': theme === 'black',
          })}
        />
        <body className={bodyClass} dir={direction} />
        <meta name='theme-color' content={plFeConfig.brandColor} />
      </Helmet>
      <InlineStyle>{`:root { ${themeCss} }`}</InlineStyle>
      {['dark', 'black'].includes(theme) && (
        <InlineStyle>{':root { color-scheme: dark; }'}</InlineStyle>
      )}
    </>
  );
};

export { PlFeHead as default };
