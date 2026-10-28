import { Button, Text, useTheme } from '@mkljczk/react-native-paper';
import { TranslateIcon } from 'phosphor-react-native/src/icons/Translate';
// import iconCircleNotch from '@phosphor-icons/core/regular/circle-notch.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { useTranslate, type PartialStatus } from '@/hooks/use-translate';

import { iconHelper } from '../ui/icon';

interface ITranslateButton {
  status: PartialStatus;
}

const StatusTranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const { colors } = useTheme();
  const translateInformation = useTranslate(status);
  const showSideBySideTranslations = false;
  if (!translateInformation /** || statusActionBarItems.includes('translate') **/) return null;

  const { translate, languageName, type, state } = translateInformation;

  const handleTranslate = () => {
    translate();
  };

  const translationLabel = () => {
    switch (state) {
      case 'translated':
        return showSideBySideTranslations ? (
          <FormattedMessage id='status.hide_translation' defaultMessage='Hide translation' />
        ) : (
          <FormattedMessage id='status.show_original' defaultMessage='Show original' />
        );

      case 'downloading':
        return (
          <FormattedMessage
            id='status.translating.downloading'
            defaultMessage='Downloading model…'
          />
        );

      case 'translating':
        return <FormattedMessage id='status.translating' defaultMessage='Translating…' />;

      case 'downloadable':
        return (
          <FormattedMessage
            id='status.translate.download'
            defaultMessage='Download model and translate locally'
          />
        );

      case 'translatable':
      default:
        if (type === 'remote') {
          return <FormattedMessage id='status.translate' defaultMessage='Translate' />;
        }
        return <FormattedMessage id='status.translate.local' defaultMessage='Translate locally' />;
    }
  };

  const button = (
    <Button
      icon={iconHelper(TranslateIcon)}
      onPress={handleTranslate}
      compact
      style={{ alignSelf: 'flex-start' }}
    >
      {translationLabel()}
    </Button>
  );

  if (state === 'translated') {
    const { provider } = translateInformation;

    return (
      <View style={{ gap: 4 }}>
        {button}
        <Text variant='bodyMedium' style={{ color: colors.outline }}>
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
        </Text>
      </View>
    );
  }

  return button;
};

export { StatusTranslateButton as default };
