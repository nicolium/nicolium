import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import InlineStyle from 'pl-fe/components/inline-style';
import BackgroundShapes from 'pl-fe/features/ui/components/background-shapes';
import { useSystemTheme } from 'pl-fe/hooks/use-system-theme';
import { useThemeCss } from 'pl-fe/hooks/use-theme-css';

import type { PlFeConfig } from 'pl-fe/normalizers/pl-fe/pl-fe-config';

interface ISitePreview {
  /** Raw pl-fe configuration. */
  plFe: PlFeConfig;
}

/** Renders a preview of the website's style with the configuration applied. */
const SitePreview: React.FC<ISitePreview> = ({ plFe }) => {
  const userTheme = plFe.defaultSettings.themeMode;
  const systemTheme = useSystemTheme();

  const dark = ['dark', 'black'].includes(userTheme as string) || (userTheme === 'system' && systemTheme === 'black');

  const themeCss = useThemeCss(plFe);

  const bodyClass = clsx(
    'site-preview',
    'align-center relative flex justify-center text-base',
    'border border-solid border-gray-200 dark:border-gray-600',
    'h-40 overflow-hidden rounded-lg',
    {
      'bg-white': !dark,
      'bg-gray-900': dark && userTheme !== 'black',
      'bg-black': userTheme === 'black',
    });

  return (
    <div className={bodyClass}>
      <InlineStyle>{`.site-preview {${themeCss}}`}</InlineStyle>
      <BackgroundShapes preview hidden={userTheme === 'black'} />

      <div className='absolute z-[2] self-center overflow-hidden rounded-lg bg-accent-500 p-2 text-white'>
        <FormattedMessage id='site_preview.preview' defaultMessage='Preview' />
      </div>

      <div
        className={clsx('absolute inset-0 z-[1] flex h-12 shadow lg:h-16', {
          'bg-white': !dark,
          'bg-gray-800': dark,
        })}
      />
    </div>
  );

};

export { SitePreview as default };
