import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Navlinks } from '@/components/navigation/navlinks';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { languages } from '@/pages/settings/components/preferences';
import { useAboutPage } from '@/queries/frontend/use-about-page';
import { aboutRoute } from '@/router';
import { useSettings } from '@/stores/settings';

interface IAbout {
  slug: string;
}

const About: React.FC<IAbout> = ({ slug }) => {
  const settings = useSettings();
  const frontendConfig = useFrontendConfig();

  const [locale, setLocale] = useState<string>(settings.locale);

  const { aboutPages } = frontendConfig;

  const page = aboutPages[slug];
  const defaultLocale = page?.defaultLocale;
  const pageLocales = page?.locales || [];
  const fetchLocale = Boolean(page && locale !== defaultLocale && pageLocales.includes(locale));

  const { data: pageHtml } = useAboutPage(slug, fetchLocale ? locale : undefined);

  const alsoAvailable = defaultLocale && (
    <div className='about-page__variants'>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />{' '}
      <ul>
        <li>
          <a
            href='#'
            onClick={() => {
              setLocale(defaultLocale);
            }}
          >
            {/* @ts-expect-error */}
            {languages[defaultLocale] ?? defaultLocale}
          </a>
        </li>
        {pageLocales?.map((locale) => (
          <li key={locale}>
            <button
              onClick={() => {
                setLocale(locale);
              }}
            >
              {/* @ts-expect-error */}
              {languages[locale] ?? locale}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className='about-page'>
      <div className='about-page__card'>
        <div className='about-page__content' data-markup>
          {pageHtml && <div dangerouslySetInnerHTML={{ __html: pageHtml }} />}
          {alsoAvailable}
        </div>
      </div>

      <Navlinks type='homeFooter' />
    </div>
  );
};

/** Displays arbitrary user-uploaded HTML on a page at `/about/:slug` */
const AboutPage: React.FC = () => {
  const { slug = 'index' } = aboutRoute.useParams();

  return <About key={slug} slug={slug} />;
};

export { About, AboutPage as default };
