import messages from '@/messages';
import { useSettings } from '@/stores/settings';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

/** Get valid locale from settings. */
const useLocale = (fallback = 'en') => {
  const localeWithVariant = useSettings().locale.replace('_', '-');
  const localeFirstPart = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant)
    ? localeWithVariant
    : Object.keys(messages).includes(localeFirstPart)
      ? localeFirstPart
      : fallback;
};

const useLocaleDirection = (locale = 'en') => (RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr');

export { useLocale, useLocaleDirection };
