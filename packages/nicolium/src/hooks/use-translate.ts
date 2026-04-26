import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useFeatures } from '@/hooks/use-features';
import { selectAccount } from '@/queries/accounts/selectors';
import { useTranslationLanguages } from '@/queries/instance/use-translation-languages';
import { useLocalStatusTranslation } from '@/queries/statuses/use-local-status-translation';
import { useStatusTranslation } from '@/queries/statuses/use-status-translation';
import { useInstance } from '@/stores/instance';
import {
  useLanguageModelAvailability,
  useLanguageModelAvailabilityActions,
} from '@/stores/language-model-availability';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

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

  const statusAccount = selectAccount(status.account_id);
  if (statusAccount && !statusAccount.local && !allowRemote) return false;

  if (!supportedLanguages[status.language]?.includes(locale)) return false;

  return true;
};

type Availability = Awaited<ReturnType<typeof Translator.availability>>;

const localTranslationAvailability = async (
  status: PartialStatus,
  locale: string,
): Promise<Availability | false> => {
  if (!('Translator' in window)) return 'unavailable';

  if (status.content.length < 0) return false;

  // TODO: support language detection
  if (status.language === null || locale === status.language || status.content_map?.[locale])
    return false;

  return Translator.availability({
    sourceLanguage: status.language,
    targetLanguage: locale,
  });
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
  const settings = useSettings();
  const autoTranslate = settings.autoTranslate;
  const knownLanguages = autoTranslate ? [...settings.knownLanguages, intl.locale] : [intl.locale];

  const me = useCurrentAccount();
  const { data: translationLanguages = {} } = useTranslationLanguages();
  const { fetchTranslation, hideTranslation } = useStatusMetaActions();
  const { fetchLocalTranslation, hideLocalTranslation } = useStatusMetaActions();
  const languageModelAvailability = useLanguageModelAvailability(status.language!, intl.locale);
  const { setLanguageModelAvailability } = useLanguageModelAvailabilityActions();
  const { targetLanguage, localTargetLanguage } = useStatusMeta(status.id);

  const remoteTranslationQuery = useStatusTranslation(status.id, targetLanguage);
  const localTranslationQuery = useLocalStatusTranslation(status.id, localTargetLanguage);

  const translationQuery = localTargetLanguage ? localTranslationQuery : remoteTranslationQuery;

  const [localTranslate, setLocalTranslate] = React.useState<
    Exclude<Availability, 'unavailable'> | false
  >();

  const remoteTranslate =
    features.translations &&
    canRemoteTranslate(status, instance, translationLanguages, intl.locale, !!me);

  useEffect(() => {
    localTranslationAvailability(status, intl.locale)
      .then((availability) => {
        setLocalTranslate(availability === 'unavailable' ? false : availability);
        if (availability) setLanguageModelAvailability(status.language!, intl.locale, availability);
      })
      .catch(() => {});
  }, [status.language, intl.locale]);

  useEffect(() => {
    if (
      translationQuery.data === undefined &&
      settings.autoTranslate &&
      remoteTranslate &&
      status.language !== null &&
      !knownLanguages.includes(status.language)
    ) {
      fetchTranslation(status.id, intl.locale);
    }
  }, []);

  if ((!remoteTranslate && !localTranslate) || translationQuery.data === false) return null;

  const type = remoteTranslate ? 'remote' : 'local';
  const state = translationQuery.data
    ? 'translated'
    : translationQuery.isLoading
      ? languageModelAvailability === 'downloading'
        ? 'downloading'
        : 'translating'
      : languageModelAvailability === 'downloadable'
        ? 'downloadable'
        : 'translatable';

  const languageName = new Intl.DisplayNames([intl.locale], { type: 'language' }).of(
    status.language!,
  );

  const provider = translationQuery.data?.provider || undefined;

  const translate = () => {
    if (localTargetLanguage) {
      hideLocalTranslation(status.id);
      return;
    }

    if (remoteTranslate) {
      if (targetLanguage) {
        hideTranslation(status.id);
      } else {
        fetchTranslation(status.id, intl.locale);
      }

      return;
    }

    fetchLocalTranslation(status.id, intl.locale);
  };

  return { type, state, languageName, provider, translate };
};

export { useTranslate, type PartialStatus };
