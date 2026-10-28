import { by639_1 } from 'iso-language-codes';
import { useIntl } from 'react-intl';

import { useCurrentAccount, useFeatures, useInstance } from '@/contexts/current-account-context';
import { selectAccount } from '@/queries/accounts/selectors';
import { useTranslationLanguages } from '@/queries/instance/use-translation-languages';
import { useStatusTranslation } from '@/queries/statuses/use-status-translation';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import { useScopeUrl } from './use-scope-url';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Instance } from 'pl-api';

type PartialStatus = Pick<
  SelectedStatus,
  'id' | 'account_id' | 'content' | 'content_map' | 'language' | 'visibility'
>;

const canRemoteTranslate = (
  status: PartialStatus,
  instance: Instance,
  supportedLanguages: Record<string, Array<string>>,
  locale: string,
  scopeUrl: string,
  isLoggedIn?: boolean,
) => {
  const { allow_remote: allowRemote, allow_unauthenticated: allowUnauthenticated } =
    instance.pleroma.metadata.translation;

  if (status.content.length < 0) return false;

  // TODO: support language detection
  if (status.language === null || locale === status.language || status.content_map?.[locale])
    return false;

  if (!['public', 'unlisted'].includes(status.visibility)) return false;

  if (!isLoggedIn && !allowUnauthenticated) return false;

  const statusAccount = selectAccount(status.account_id, scopeUrl);
  if (statusAccount && !statusAccount.local && !allowRemote) return false;

  if (!supportedLanguages[status.language]?.includes(locale)) return false;

  return true;
};

interface TranslateInformation {
  translate: () => void;
  languageName?: string;
  type: 'remote' | 'local';
  state: 'translated' | 'translating' | 'translatable' | 'downloading' | 'downloadable';
  provider?: string;
}

const useTranslate = (status: PartialStatus): TranslateInformation | null => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  // const settings = useSettings();
  // const autoTranslate = settings.autoTranslate;
  // const knownLanguages = /**autoTranslate ? [...settings.knownLanguages, intl.locale] :  */ [
  //   intl.locale,
  // ];

  const me = useCurrentAccount();
  const scopeUrl = useScopeUrl();
  const { data: translationLanguages = {} } = useTranslationLanguages();
  const { fetchTranslation, hideTranslation } = useStatusMetaActions();
  const { targetLanguage } = useStatusMeta(status.id);

  const remoteTranslationQuery = useStatusTranslation(status.id, targetLanguage);

  const translationQuery = remoteTranslationQuery;

  const remoteTranslate =
    features.translations &&
    canRemoteTranslate(status, instance, translationLanguages, intl.locale, scopeUrl, !!me);

  // React.useEffect(() => {
  //   if (
  //     translationQuery.data === undefined &&
  //     // settings.autoTranslate &&
  //     remoteTranslate &&
  //     status.language !== null &&
  //     !knownLanguages.includes(status.language)
  //   ) {
  //     fetchTranslation(status.id, intl.locale);
  //   }
  // }, []);

  if (!remoteTranslate || translationQuery.data === false) return null;

  const type = 'remote';
  const state = translationQuery.data
    ? 'translated'
    : translationQuery.isLoading
      ? 'translating'
      : 'translatable';

  const languageName = by639_1[status.language as 'en']?.name;

  const provider = translationQuery.data?.provider || undefined;

  const translate = () => {
    if (targetLanguage) {
      hideTranslation(status.id);
    } else {
      fetchTranslation(status.id, intl.locale);
    }
  };

  return { type, state, languageName, provider, translate };
};

export { useTranslate, type PartialStatus };
