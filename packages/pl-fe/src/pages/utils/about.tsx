import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Navlinks } from '@/components/navlinks';
import Card from '@/components/ui/card';
import { languages } from '@/features/preferences';
import { aboutRoute } from '@/features/ui/router';
import { usePlFeConfig } from '@/hooks/use-pl-fe-config';
import { useAboutPage } from '@/queries/pl-fe/use-about-page';
import { useSettings } from '@/stores/settings';

interface IAbout {
  slug: string;
}

const About: React.FC<IAbout> = ({ slug }) => {
  const settings = useSettings();
  const plFeConfig = usePlFeConfig();

  const [locale, setLocale] = useState<string>(settings.locale);

  const { aboutPages } = plFeConfig;

  const page = aboutPages[slug];
  const defaultLocale = page?.defaultLocale;
  const pageLocales = page?.locales || [];
  const fetchLocale = Boolean(page && locale !== defaultLocale && pageLocales.includes(locale));

  const { data: pageHtml } = useAboutPage(slug, fetchLocale ? locale : undefined);

  const alsoAvailable = (defaultLocale) && (
    <div>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />
      {' '}
      <ul className='inline list-none p-0'>
        <li className="inline after:content-['_·_']">
          <a href='#' onClick={() => setLocale(defaultLocale)}>
            {/* @ts-ignore */}
            {languages[defaultLocale] || defaultLocale}
          </a>
        </li>
        {
          pageLocales?.map(locale => (
            <li className="inline after:content-['_·_'] last:after:content-none" key={locale}>
              <a href='#' onClick={() => setLocale(locale)}>
                {/* @ts-ignore */}
                {languages[locale] || locale}
              </a>
            </li>
          ))
        }
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
