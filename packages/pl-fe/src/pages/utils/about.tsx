import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Navlinks } from '@/components/navlinks';
import Card from '@/components/ui/card';
import { languages } from '@/features/preferences';
import { aboutRoute } from '@/features/ui/router';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useAboutPage } from '@/queries/frontend/use-about-page';
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
    <div>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />{' '}
      <ul className='inline list-none p-0'>
        <li className="inline after:content-['_·_']">
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
          <li className="inline after:content-['_·_'] last:after:content-none" key={locale}>
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
    <div>
      <Card variant='rounded'>
        <div className='prose mx-auto py-4 dark:prose-invert sm:p-6'>
          {pageHtml && <div dangerouslySetInnerHTML={{ __html: pageHtml }} />}
          {alsoAvailable}
        </div>
      </Card>

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
