import iconCircleNotch from '@phosphor-icons/core/regular/circle-notch.svg';
import iconTranslate from '@phosphor-icons/core/regular/translate.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useTranslate, type PartialStatus } from '@/hooks/use-translate';
import { useSettings } from '@/stores/settings';

interface ITranslateButton {
  status: PartialStatus;
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const translateInformation = useTranslate(status);
  const { showSideBySideTranslations } = useSettings();
  if (!translateInformation) return null;

  const { translate, languageName, type, state } = translateInformation;

  const handleTranslate: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    translate();
  };

  const translationLabel = () => {
    if (state === 'translated') {
      return showSideBySideTranslations ? (
        <FormattedMessage id='status.hide_translation' defaultMessage='Hide translation' />
      ) : (
        <FormattedMessage id='status.show_original' defaultMessage='Show original' />
      );
    }

    if (state === 'downloading') {
      return (
        <FormattedMessage id='status.translating.downloading' defaultMessage='Downloading model…' />
      );
    }

    if (state === 'translating') {
      return <FormattedMessage id='status.translating' defaultMessage='Translating…' />;
    }

    if (state === 'downloadable') {
      return (
        <FormattedMessage
          id='status.translate.download'
          defaultMessage='Download model and translate locally'
        />
      );
    }

    if (state === 'translatable') {
      return <FormattedMessage id='status.translate' defaultMessage='Translate' />;
    }

    return <FormattedMessage id='status.translate.local' defaultMessage='Translate locally' />;
  };

  const button = (
    <button className='⁂-translate-button' onClick={handleTranslate}>
      <Icon src={iconTranslate} className='⁂-translate-button__icon' />
      <span>{translationLabel()}</span>
      {(state === 'translating' || state === 'downloading') && (
        <Icon
          src={iconCircleNotch}
          className='⁂-translate-button__icon ⁂-translate-button__icon--loading'
        />
      )}
    </button>
  );

  if (state === 'translated') {
    const { provider } = translateInformation;

    return (
      <div className='⁂-translate-button__container'>
        {button}
        <p className='⁂-translate-button__info'>
          <FormattedMessage
            id='status.translated_from_with'
            defaultMessage='Translated from {lang} {provider}'
            values={{
              lang: languageName,
              provider:
                type === 'local' ? (
                  <FormattedMessage
                    id='status.translated_from_with.provider.local'
                    defaultMessage='using local model'
                  />
                ) : provider ? (
                  <FormattedMessage
                    id='status.translated_from_with.provider'
                    defaultMessage='with {provider}'
                    values={{ provider }}
                  />
                ) : undefined,
            }}
          />
        </p>
      </div>
    );
  }

  return button;
};

export { TranslateButton as default };
