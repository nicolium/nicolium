import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import InlineStyle from '@/components/inline-style';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useThemeCss } from '@/hooks/use-theme-css';

import type { FrontendConfig } from '@/schemas/frontend-config';

interface ISitePreview {
  /** Raw Nicolium configuration. */
  frontendConfig: FrontendConfig;
}

/** Renders a preview of the website's style with the configuration applied. */
const SitePreview: React.FC<ISitePreview> = ({ frontendConfig }) => {
  const userTheme = frontendConfig.defaultSettings.themeMode;
  const systemTheme = useSystemTheme();

  const dark =
    ['dark', 'black'].includes(userTheme as string) ||
    (userTheme === 'system' && systemTheme === 'black');

  const themeCss = useThemeCss(frontendConfig);

  const bodyClass = clsx('site-preview', {
    'site-preview--dark': dark && userTheme !== 'black',
    'site-preview--black': userTheme === 'black',
  });

  return (
    <div className={bodyClass}>
      <InlineStyle>{`.site-preview {${themeCss}}`}</InlineStyle>

      <div className='site-preview__label'>
        <FormattedMessage id='site_preview.preview' defaultMessage='Preview' />
      </div>

      <div className='site-preview__header' />
    </div>
  );
};

export { SitePreview as default };
