import clsx from 'clsx';
import fuzzysort from 'fuzzysort';
import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  addComposeLanguage,
  changeComposeLanguage,
  changeComposeModifiedLanguage,
  deleteComposeLanguage,
} from '@/actions/compose';
import DropdownMenu from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { type Language, languages as languagesObject } from '@/features/preferences';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useFeatures } from '@/hooks/use-features';
import { useSettings } from '@/stores/settings';

const getFrequentlyUsedLanguages = (languageCounters: Record<string, number>) =>
  Object.keys(languageCounters)
    .toSorted((a, b) => languageCounters[a] - languageCounters[b])
    .toReversed();

const languages = Object.entries(languagesObject) as Array<[Language, string]>;

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
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  addLanguage: { id: 'compose.language_dropdown.add_language', defaultMessage: 'Add language' },
  deleteLanguage: {
    id: 'compose.language_dropdown.delete_language',
    defaultMessage: 'Delete language',
  },
});

interface ILanguageDropdown {
  handleClose: () => any;
}

const getLanguageDropdown =
  (composeId: string): React.FC<ILanguageDropdown> =>
  ({ handleClose: handleMenuClose }) => {
    const intl = useIntl();
    const features = useFeatures();
    const dispatch = useAppDispatch();
    const settings = useSettings();
    const frequentlyUsedLanguages = useMemo(
      () => getFrequentlyUsedLanguages(settings.frequentlyUsedLanguages),
      [settings.frequentlyUsedLanguages],
    );

    const node = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);

    const [searchValue, setSearchValue] = useState('');

    const { language, modifiedLanguage, textMap } = useCompose(composeId);

    const hasMultipleLanguages = !!Object.keys(textMap).length;

    const handleOptionClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
      const value = (e.currentTarget as HTMLElement)?.getAttribute('data-index') as Language;

      if (Object.keys(textMap).length) {
        if (!(value in textMap || language === value)) return;

        dispatch(changeComposeModifiedLanguage(composeId, value));
      } else {
        dispatch(changeComposeLanguage(composeId, value));
      }

      e.preventDefault();

      handleClose();
    };

    const handleAddLanguageClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
      const value = (e.currentTarget as HTMLElement)?.parentElement?.getAttribute(
        'data-index',
      ) as Language;

      e.preventDefault();
      e.stopPropagation();

      dispatch(addComposeLanguage(composeId, value));
    };

    const handleDeleteLanguageClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
      const value = (e.currentTarget as HTMLElement)?.parentElement?.getAttribute(
        'data-index',
      ) as Language;

      e.preventDefault();
      e.stopPropagation();

      dispatch(deleteComposeLanguage(composeId, value));
    };

    const handleClear: React.MouseEventHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setSearchValue('');
    };

    const search = (value: string) => {
      if (value === '') {
        return [...languages].sort((a, b) => {
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
            // Sort according to frequently used languages

            const indexOfA = frequentlyUsedLanguages.indexOf(a[0]);
            const indexOfB = frequentlyUsedLanguages.indexOf(b[0]);

            return (indexOfA > -1 ? indexOfA : Infinity) - (indexOfB > -1 ? indexOfB : Infinity);
          }
        });
      }

      return fuzzysort
        .go(value, languages, {
          keys: ['0', '1'],
          limit: 5,
          threshold: -10000,
        })
        .map((result) => result.obj);
    };

    const handleClose = () => {
      setSearchValue('');
      handleMenuClose();
    };

    useEffect(() => {
      if (!language) input.current?.focus();
    }, [input.current]);

    useEffect(() => {
      if (node.current) {
        (node.current?.querySelector('button[aria-selected=true]') as HTMLButtonElement)?.focus();
      }
    }, [node.current]);

    const isSearching = searchValue !== '';

    const deferredSearchValue = useDeferredValue(searchValue);
    const results = useMemo(() => search(deferredSearchValue), [deferredSearchValue]);

    return (
      <>
        <label className='⁂-language-dropdown__search'>
          <span>{intl.formatMessage(messages.search)}</span>

          <Input
            ref={input}
            className='w-64'
            type='text'
            value={searchValue}
            onChange={({ target }) => {
              setSearchValue(target.value);
            }}
            outerClassName='mt-0'
            placeholder={intl.formatMessage(messages.search)}
          />
          <button
            tabIndex={0}
            onClick={handleClear}
            title={
              isSearching ? intl.formatMessage(messages.clear) : intl.formatMessage(messages.search)
            }
          >
            <Icon
              src={
                isSearching
                  ? require('@phosphor-icons/core/regular/backspace.svg')
                  : require('@phosphor-icons/core/regular/magnifying-glass.svg')
              }
              aria-hidden
            />
          </button>
        </label>
        <div className='⁂-language-dropdown__options' tabIndex={-1} ref={node} role='listbox'>
          {results.map(([code, name]) => {
            const active = code === language;
            const modified = code === modifiedLanguage;

            return (
              <button
                role='option'
                tabIndex={0}
                key={code}
                data-index={code}
                onClick={handleOptionClick}
                className={clsx('⁂-language-dropdown__option', {
                  '⁂-language-dropdown__option--modified': modified,
                  '⁂-language-dropdown__option--available':
                    !hasMultipleLanguages || code in textMap,
                  '⁂-language-dropdown__option--active': active,
                })}
                aria-selected={active}
              >
                <div className='⁂-language-dropdown__option__name'>{name}</div>
                {features.multiLanguage &&
                  !!language &&
                  !active &&
                  (code in textMap ? (
                    <button
                      title={intl.formatMessage(messages.deleteLanguage)}
                      onClick={handleDeleteLanguageClick}
                    >
                      <Icon src={require('@phosphor-icons/core/regular/minus.svg')} />
                    </button>
                  ) : (
                    <button
                      title={intl.formatMessage(messages.addLanguage)}
                      onClick={handleAddLanguageClick}
                    >
                      <Icon src={require('@phosphor-icons/core/regular/plus.svg')} />
                    </button>
                  ))}
              </button>
            );
          })}
        </div>
      </>
    );
  };

interface ILanguageDropdownButton {
  composeId: string;
  compact?: boolean;
}

const LanguageDropdownButton: React.FC<ILanguageDropdownButton> = ({ composeId, compact }) => {
  const intl = useIntl();

  const { language, modifiedLanguage, suggestedLanguage, textMap } = useCompose(composeId);

  const languagesCount = Object.keys(textMap).length;

  let buttonLabel = compact ? undefined : intl.formatMessage(messages.languagePrompt);
  if (language) {
    const list: string[] = [languagesObject[(modifiedLanguage ?? language) as Language]];
    if (languagesCount)
      list.push(
        intl.formatMessage(messages.multipleLanguages, {
          count: languagesCount,
        }),
      );
    buttonLabel = intl.formatList(list);
  } else if (suggestedLanguage)
    buttonLabel = intl.formatMessage(messages.languageSuggestion, {
      language: languagesObject[suggestedLanguage as Language] || suggestedLanguage,
    });

  const LanguageDropdown = useMemo(() => getLanguageDropdown(composeId), [composeId]);

  return (
    <DropdownMenu component={LanguageDropdown} className='⁂-language-dropdown'>
      <button title={intl.formatMessage(messages.languagePrompt)}>
        <Icon src={require('@phosphor-icons/core/regular/translate.svg')} aria-hidden />
        {buttonLabel}
        <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { LanguageDropdownButton as default };
