import 'core-js/actual/array/to-sorted';
import 'react-native-get-random-values';
import { shouldPolyfill as shouldPolyfillDateTimeFormat } from '@formatjs/intl-datetimeformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillGetCanonicalLocales } from '@formatjs/intl-getcanonicallocales/should-polyfill';
import { shouldPolyfill as shouldPolyfillListFormat } from '@formatjs/intl-listformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill';
import { shouldPolyfill as shouldPolyfillNumberFormat } from '@formatjs/intl-numberformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillPluralRules } from '@formatjs/intl-pluralrules/should-polyfill';
import { shouldPolyfill as shouldPolyfillRelativeTimeFormat } from '@formatjs/intl-relativetimeformat/should-polyfill';

async function loadPolyfills() {
  // 1. getCanonicalLocales — no deps
  if (shouldPolyfillGetCanonicalLocales()) {
    require('@formatjs/intl-getcanonicallocales/polyfill'); 
  }

  // 2. Locale — depends on getCanonicalLocales
  if (shouldPolyfillLocale()) {
    require('@formatjs/intl-locale/polyfill');
  }

  // 3. PluralRules — depends on Locale
  if (shouldPolyfillPluralRules('en')) {
    require('@formatjs/intl-pluralrules/polyfill-force');
    require(`@formatjs/intl-pluralrules/locale-data/en`);
  }

  // 4. NumberFormat — depends on PluralRules, Locale
  if (shouldPolyfillNumberFormat('en')) {
    require('@formatjs/intl-numberformat/polyfill-force');
    require(`@formatjs/intl-numberformat/locale-data/en`);
  }

  // 5. DateTimeFormat — depends on Locale
  if (shouldPolyfillDateTimeFormat('en')) {
    require('@formatjs/intl-datetimeformat/polyfill-force');
    require(`@formatjs/intl-datetimeformat/locale-data/en`);
    // Add timezone data if needed
    require('@formatjs/intl-datetimeformat/add-all-tz');
  }

  // 6. RelativeTimeFormat — depends on PluralRules, Locale
  if (shouldPolyfillRelativeTimeFormat('en')) {
    require('@formatjs/intl-relativetimeformat/polyfill-force');
    require(`@formatjs/intl-relativetimeformat/locale-data/en`);
  }

  if (shouldPolyfillListFormat('en')) {
    require('@formatjs/intl-listformat/polyfill-force');
    require(`@formatjs/intl-listformat/locale-data/en`);
  }
}

export { loadPolyfills };
