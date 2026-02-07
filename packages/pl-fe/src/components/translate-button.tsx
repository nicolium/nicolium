import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';
import { useTranslationLanguages } from '@/queries/instance/use-translation-languages';
import { useLocalStatusTranslation } from '@/queries/statuses/use-local-status-translation';
import { useStatusTranslation } from '@/queries/statuses/use-status-translation';
import { useLanguageModelAvailability, useLanguageModelAvailabilityActions } from '@/stores/language-model-availability';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import type { Status } from '@/normalizers/status';
import type { Instance } from 'pl-api';

const canRemoteTranslate = (status: ITranslateButton['status'], instance: Instance, supportedLanguages: Record<string, Array<string>>, locale: string, isLoggedIn?: boolean) => {
  const {
    allow_remote: allowRemote,
    allow_unauthenticated: allowUnauthenticated,
  } = instance.pleroma.metadata.translation;

  if (status.content.length < 0) return false;

  // TODO: support language detection
  if (status.language === null || locale === status.language || status.content_map?.[locale]) return false;

  if (!['public', 'unlisted'].includes(status.visibility)) return false;

  if (!isLoggedIn && !allowUnauthenticated) return false;

  if (!status.account.local && !allowRemote) return false;

  if (!supportedLanguages[status.language!]?.includes(locale)) return false;

  return true;
};

type Availability = Awaited<ReturnType<typeof Translator.availability>>;

const localTranslationAvailability = async (status: ITranslateButton['status'], locale: string): Promise<Availability | false> => {
  if (!('Translator' in window)) return 'unavailable';

  if (status.content.length < 0) return false;

  // TODO: support language detection
  if (status.language === null || locale === status.language || status.content_map?.[locale]) return false;

  return Translator.availability({
    sourceLanguage: status.language,
    targetLanguage: locale,
  });
};

interface ITranslateButton {
  status: Pick<Status, 'id' | 'account' | 'content' | 'content_map' | 'language' | 'visibility'>;
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const settings = useSettings();
  const autoTranslate = settings.autoTranslate;
  const knownLanguages = autoTranslate ? [...settings.knownLanguages, intl.locale] : [intl.locale];

  const me = useAppSelector((state) => state.me);
  const { data: translationLanguages = {} } = useTranslationLanguages();
  const { fetchTranslation, hideTranslation } = useStatusMetaActions();
  const { fetchLocalTranslation, hideLocalTranslation } = useStatusMetaActions();
  const languageModelAvailability = useLanguageModelAvailability(status.language!, intl.locale);
  const { setLanguageModelAvailability } = useLanguageModelAvailabilityActions();
  const { targetLanguage, localTargetLanguage } = useStatusMeta(status.id);

  const remoteTranslationQuery = useStatusTranslation(status.id, targetLanguage);
  const localTranslationQuery = useLocalStatusTranslation(status.id, localTargetLanguage);

  const translationQuery = localTargetLanguage ? localTranslationQuery : remoteTranslationQuery;

  const [localTranslate, setLocalTranslate] = React.useState<Exclude<Availability, 'unavailable'> | false>();

  const remoteTranslate = features.translations && canRemoteTranslate(status, instance, translationLanguages, intl.locale, !!me);

  useEffect(() => {
    localTranslationAvailability(status, intl.locale).then((availability) => {
      setLocalTranslate(availability === 'unavailable' ? false : availability);
      if (availability) setLanguageModelAvailability(status.language!, intl.locale, availability);
    }).catch(() => {});
  }, [status.language, intl.locale]);

  const handleTranslate: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (localTargetLanguage) return hideLocalTranslation(status.id);

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

  useEffect(() => {
    if (translationQuery.data === undefined && settings.autoTranslate && remoteTranslate && status.language !== null && !knownLanguages.includes(status.language)) {
      fetchTranslation(status.id, intl.locale);
    }
  }, []);

  if (!remoteTranslate && !localTranslate || translationQuery.data === false) return null;

  const translationLabel = () => {
    if (translationQuery.data) {
      return (
        <FormattedMessage id='status.show_original' defaultMessage='Show original' />
      );
    }

    if (translationQuery.isLoading) {
      if (languageModelAvailability === 'downloading') {
        return (
          <FormattedMessage id='status.translating.downloading' defaultMessage='Downloading model…' />
        );
      }

      return (
        <FormattedMessage id='status.translating' defaultMessage='Translating…' />
      );
    }

    if (remoteTranslate) {
      return (
        <FormattedMessage id='status.translate' defaultMessage='Translate' />
      );
    }

    if (localTranslate && languageModelAvailability !== 'downloadable') {
      return (
        <FormattedMessage id='status.translate.local' defaultMessage='Translate locally' />
      );
    }

    return (
      <FormattedMessage id='status.translate.download' defaultMessage='Download model and translate locally' />
    );
  };

  const button = (
    <button className='flex w-fit items-center gap-1 text-primary-600 hover:underline dark:text-gray-600' onClick={handleTranslate}>
      <Icon src={require('@phosphor-icons/core/regular/translate.svg')} className='size-4' />
      <span>
        {translationLabel()}
      </span>
      {translationQuery.isLoading && (
        <Icon src={require('@phosphor-icons/core/regular/circle-notch.svg')} className='size-4 animate-spin' />
      )}
    </button>
  );

  if (translationQuery.data) {
    const languageNames = new Intl.DisplayNames([intl.locale], { type: 'language' });
    const languageName = languageNames.of(status.language!);
    const provider = translationQuery.data.provider;

    return (
      <Stack space={3} alignItems='start'>
        {button}
        <Text theme='muted'>
          <FormattedMessage
            id='status.translated_from_with'
            defaultMessage='Translated from {lang} {provider}'
            values={{
              lang: languageName,
              provider: localTargetLanguage
                ? <FormattedMessage id='status.translated_from_with.provider.local' defaultMessage='using local model' />
                : provider
                  ? <FormattedMessage id='status.translated_from_with.provider' defaultMessage='with {provider}' values={{ provider }} />
                  : undefined,
            }}
          />
        </Text>
      </Stack>
    );
  }

  return button;
};

export { TranslateButton as default };
