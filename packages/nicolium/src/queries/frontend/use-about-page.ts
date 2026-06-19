import { staticFetch } from '@/api';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const fetchAboutPage = async (slug: string, locale?: string) => {
  const filename = `${slug}${locale ? `.${locale}` : ''}.html`;

  const { data } = await staticFetch(`/instance/about/${filename}`);

  if (data.includes('id="app"')) return '';

  return data;
};

const useAboutPage = (slug = 'index', locale?: string) =>
  useAppQuery({
    queryKey: queryKeys.frontend.aboutPages(slug, locale),
    queryFn: () => fetchAboutPage(slug, locale),
  });

export { useAboutPage };
