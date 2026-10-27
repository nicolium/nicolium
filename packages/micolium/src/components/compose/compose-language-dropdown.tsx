import { TrueSheet } from '@lodev09/react-native-true-sheet';
import {
  Chip,
  Icon,
  IconButton,
  List,
  Searchbar,
  Text,
  useTheme,
} from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import { useLocales } from 'expo-localization';
import fuzzysort from 'fuzzysort';
import { by639_1, codes, type Code } from 'iso-language-codes';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { MinusIcon } from 'phosphor-react-native/src/icons/Minus';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { TranslateIcon } from 'phosphor-react-native/src/icons/Translate';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, Pressable, View } from 'react-native';

import { useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCompose, useComposeActions } from '@/stores/compose';
import { useSetting } from '@/stores/settings';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';

type Language = Code['iso639_1'];

const getNativeName = (code: string): string | undefined =>
  by639_1[code as Language]?.nativeName.split(', ')[0];

const languages = codes
  .toSorted((a, b) => a.iso639_1.localeCompare(b.iso639_1))
  .map(({ iso639_1, name }) => [iso639_1, getNativeName(iso639_1)!, name]) as Array<
  [Language, string, string]
>;

const messages = defineMessages({
  languagePrompt: { id: 'compose.language_dropdown.prompt', defaultMessage: 'Select language' },
  languageSuggestion: {
    id: 'compose.language_dropdown.suggestion',
    defaultMessage: '{language} (detected)',
  },
  multipleLanguages: {
    id: 'compose.language_dropdown.more_languages',
    defaultMessage: '{count, plural, one {# more language} other {# more languages}}',
  },
  search: { id: 'compose.language_dropdown.search', defaultMessage: 'Search language…' },
  addLanguage: { id: 'compose.language_dropdown.add_language', defaultMessage: 'Add language' },
  deleteLanguage: {
    id: 'compose.language_dropdown.delete_language',
    defaultMessage: 'Delete language',
  },
});

const ItemSeparator = () => <View style={{ height: 2 }} />;

interface ILanguagePicker {
  composeId: string;
  onClose: () => void;
}

const LanguagePicker = React.forwardRef<FlashListRef<[Language, string, string]>, ILanguagePicker>(
  ({ composeId, onClose }, ref) => {
    const theme = useTheme();
    const intl = useIntl();
    const features = useFeatures();
    const { updateCompose } = useComposeActions();
    const locales = useLocales();
    const localeLanguages = locales.map(({ languageCode }) => languageCode);

    const [searchValue, setSearchValue] = React.useState('');

    const compose = useCompose(composeId);
    const { language, modifiedLanguage, textMap } = compose;

    const hasMultipleLanguages = !!Object.keys(textMap).length;

    const handleOptionClick = (value: Language) => {
      if (Object.keys(textMap).length) {
        if (!(value in textMap || language === value)) return;

        updateCompose(composeId, (draft) => {
          draft.modifiedLanguage = value;
        });
      } else {
        updateCompose(composeId, (draft) => {
          draft.language = value;
          draft.modifiedLanguage = value;
        });
      }

      onClose();
    };

    const handleAddLanguageClick = (value: Language) => {
      updateCompose(composeId, (draft) => {
        draft.textMap[value] = draft.text;
        draft.spoilerTextMap[value] = draft.spoilerText;
        if (draft.poll)
          draft.poll.options_map.forEach(
            (option, key) => (option[value] = draft.poll!.options[key]),
          );
      });
    };

    const handleDeleteLanguageClick = (value: Language) => {
      updateCompose(composeId, (draft) => {
        delete draft.textMap[value];
        delete draft.spoilerTextMap[value];
      });
    };

    const search = (value: string) => {
      if (value === '') {
        return languages.toSorted((a, b) => {
          // Push current selection to the top of the list

          if (a[0] in textMap) {
            if (b[0] === language) return 1;
            return -1;
          }
          if (b[0] in textMap) {
            if (a[0] === language) return -1;
            return 1;
          }
          if (a[0] === language) {
            return -1;
          } else if (b[0] === language) {
            return 1;
          } else {
            // Sort according to device locales

            const indexOfA = localeLanguages.indexOf(a[0]);
            const indexOfB = localeLanguages.indexOf(b[0]);

            return (indexOfA > -1 ? indexOfA : Infinity) - (indexOfB > -1 ? indexOfB : Infinity);
          }
        });
      }

      return fuzzysort
        .go(value, languages, {
          keys: ['0', '1', '2'],
          limit: 5,
          threshold: -10000,
        })
        .map((result) => result.obj);
    };

    const deferredSearchValue = React.useDeferredValue(searchValue);
    const results = React.useMemo(() => search(deferredSearchValue), [deferredSearchValue]);

    return (
      <FlashList
        ref={ref}
        data={results}
        extraData={compose}
        keyExtractor={([code]) => code}
        ListHeaderComponent={
          <Searchbar
            placeholder={intl.formatMessage(messages.search)}
            value={searchValue}
            onChangeText={setSearchValue}
            style={{
              marginHorizontal: 0,
              marginBottom: 16,
              borderColor: theme.colors.outlineVariant,
              borderWidth: 1,
            }}
          />
        }
        ItemSeparatorComponent={ItemSeparator}
        renderItem={({ item: [code, name], index }) => {
          const active = code === language;
          const modified = code === (modifiedLanguage ?? language);
          const available = !hasMultipleLanguages || code in textMap || active;

          return (
            <List.Item
              title={name}
              onPress={() => handleOptionClick(code)}
              style={getSegmentedMenuStyles(theme, modified, index, results.length)}
              titleStyle={{ opacity: available ? 1 : 0.38 }}
              right={({ style }) =>
                features.multiLanguage && !!language && !active ? (
                  code in textMap ? (
                    <IconButton
                      icon={iconHelper(MinusIcon)}
                      style={[style, { marginVertical: -8, marginRight: -8 }]}
                      onPress={() => handleDeleteLanguageClick(code)}
                      accessibilityLabel={intl.formatMessage(messages.deleteLanguage)}
                    />
                  ) : (
                    <IconButton
                      icon={iconHelper(PlusIcon)}
                      style={[style, { marginVertical: -8, marginRight: -8 }]}
                      onPress={() => handleAddLanguageClick(code)}
                      accessibilityLabel={intl.formatMessage(messages.addLanguage)}
                    />
                  )
                ) : active ? (
                  <List.Icon icon={iconHelper(CheckIcon)} style={style} />
                ) : null
              }
            />
          );
        }}
      />
    );
  },
);

LanguagePicker.displayName = 'LanguagePicker';

interface IComposeLanguagePicker {
  composeId: string;
  visible: boolean;
  onDismiss: () => void;
}

const ComposeLanguagePicker: React.FC<IComposeLanguagePicker> = ({
  composeId,
  visible,
  onDismiss,
}) => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();

  const [closing, setClosing] = React.useState(false);

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<FlashListRef<[Language, string, string]>>(null);

  React.useEffect(() => {
    if (visible) setClosing(false);
  }, [visible]);

  React.useEffect(() => {
    if (visible && !closing) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, closing]);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={[0.5, 'auto']}
      onDidDismiss={onDismiss}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32, paddingHorizontal: 16 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <LanguagePicker ref={scrollableRef} composeId={composeId} onClose={() => setClosing(true)} />
    </TrueSheet>
  );
};

const ComposeLanguageDropdown: React.FC<ICompose> = ({ composeId }) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();

  const [showPicker, setShowPicker] = React.useState(false);

  const { language, modifiedLanguage, suggestedLanguage, textMap } = useCompose(composeId);
  const defaultLanguage = useSetting('compose.defaultLanguage');

  const languagesCount = Object.keys(textMap).length;

  let label = intl.formatMessage(messages.languagePrompt);
  if (language || (defaultLanguage && defaultLanguage !== 'detect')) {
    let displayedLanguage: string | undefined = modifiedLanguage ?? language ?? defaultLanguage!;
    const list: string[] = [getNativeName(displayedLanguage) ?? displayedLanguage];
    if (languagesCount)
      list.push(
        intl.formatMessage(messages.multipleLanguages, {
          count: languagesCount,
        }),
      );
    label = intl.formatList(list);
  } else if (suggestedLanguage)
    label = intl.formatMessage(messages.languageSuggestion, {
      language: getNativeName(suggestedLanguage) || suggestedLanguage,
    });

  const handlePress = () => setShowPicker(true);

  const chip = glassEffect ? (
    <Pressable onPress={handlePress}>
      <GlassView
        style={{
          gap: 4,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}
        accessibilityLabel={intl.formatMessage(messages.languagePrompt)}
      >
        <Icon source={iconHelper(TranslateIcon)} size={20} color={colors.onSurfaceVariant} />
        <Text>{label}</Text>
        <Icon source={iconHelper(CaretDownIcon)} size={16} color={colors.onSurfaceVariant} />
      </GlassView>
    </Pressable>
  ) : (
    <Chip
      mode='outlined'
      icon={iconHelper(TranslateIcon)}
      onPress={handlePress}
      accessibilityLabel={intl.formatMessage(messages.languagePrompt)}
    >
      {label}
      <View style={{ paddingLeft: 4 }}>
        <Icon source={iconHelper(CaretDownIcon)} size={16} color={colors.onSurfaceVariant} />
      </View>
    </Chip>
  );

  return (
    <>
      {chip}
      {showPicker && (
        <ComposeLanguagePicker
          composeId={composeId}
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export { ComposeLanguageDropdown };
