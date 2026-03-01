import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting, saveSettings } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import HStack from '@/components/ui/hstack';
import { Multiselect } from '@/components/ui/multiselect';
import StepSlider from '@/components/ui/step-slider';
import { SelectDropdown } from '@/features/forms';
import SettingToggle from '@/features/settings/components/setting-toggle';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';
import { PaletteListItem } from '@/pages/dashboard/theme-editor';
import { useSettings } from '@/stores/settings';
import sourceCode from '@/utils/code';
import colors from '@/utils/colors';
import { isStandalone } from '@/utils/state';

import ThemeToggle from '../ui/components/theme-toggle';

import type { AppDispatch } from '@/store';

const languages = {
  en: 'English',
  ar: 'العربية',
  ast: 'Asturianu',
  bg: 'Български',
  bn: 'বাংলা',
  ca: 'Català',
  co: 'Corsu',
  cs: 'Čeština',
  cy: 'Cymraeg',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  'en-GB': 'English (UK)',
  'en-Shaw': '𐑖𐑱𐑝𐑾𐑯',
  eo: 'Esperanto',
  es: 'Español',
  eu: 'Euskara',
  fa: 'فارسی',
  fi: 'Suomi',
  fr: 'Français',
  ga: 'Gaeilge',
  gl: 'Galego',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hu: 'Magyar',
  hy: 'Հայերեն',
  id: 'Bahasa Indonesia',
  io: 'Ido',
  is: 'íslenska',
  it: 'Italiano',
  ja: '日本語',
  jv: 'ꦧꦱꦗꦮ',
  ka: 'ქართული',
  kk: 'Қазақша',
  ko: '한국어',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  ml: 'മലയാളം',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  no: 'Norsk',
  oc: 'Occitan',
  pl: 'Polszczyzna',
  pt: 'Português',
  'pt-BR': 'Português do Brasil',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sq: 'Shqip',
  sr: 'Српски',
  'sr-Latn': 'Srpski (latinica)',
  sv: 'Svenska',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文（香港）',
  'zh-TW': '繁體中文（臺灣）',
} as const;

type Language = keyof typeof languages;

const INTERFACE_SIZES = ['sm', 'md', 'lg', 'xl'] as const;

const messages = defineMessages({
  heading: { id: 'column.preferences', defaultMessage: 'Preferences' },
  displayPostsDefault: {
    id: 'preferences.fields.display_media.default',
    defaultMessage: 'Hide posts marked as sensitive',
  },
  displayPostsHideAll: {
    id: 'preferences.fields.display_media.hide_all',
    defaultMessage: 'Always hide media posts',
  },
  displayPostsShowAll: {
    id: 'preferences.fields.display_media.show_all',
    defaultMessage: 'Always show posts',
  },
  privacyPublic: { id: 'preferences.options.privacy_public', defaultMessage: 'Public' },
  privacyUnlisted: { id: 'preferences.options.privacy_unlisted', defaultMessage: 'Unlisted' },
  privacyFollowersOnly: {
    id: 'preferences.options.privacy_followers_only',
    defaultMessage: 'Followers-only',
  },
  contentTypePlaintext: {
    id: 'preferences.options.content_type_plaintext',
    defaultMessage: 'Plain text',
  },
  contentTypeMarkdown: {
    id: 'preferences.options.content_type_markdown',
    defaultMessage: 'Markdown',
  },
  contentTypeHtml: { id: 'preferences.options.content_type_html', defaultMessage: 'HTML' },
  contentTypeWysiwyg: {
    id: 'preferences.options.content_type_wysiwyg',
    defaultMessage: 'WYSIWYG',
  },
  brandColor: { id: 'preferences.options.brand_color', defaultMessage: 'Base color' },
  interfaceSizeSmall: {
    id: 'preferences.options.interface_size.sm',
    defaultMessage: 'Small',
  },
  interfaceSizeMedium: {
    id: 'preferences.options.interface_size.md',
    defaultMessage: 'Medium',
  },
  interfaceSizeLarge: {
    id: 'preferences.options.interface_size.lg',
    defaultMessage: 'Large',
  },
  interfaceSizeExtraLarge: {
    id: 'preferences.options.interface_size.xl',
    defaultMessage: 'Extra large',
  },
  dark: { id: 'theme_toggle.dark', defaultMessage: 'Dark' },
  black: { id: 'theme_toggle.black', defaultMessage: 'Black' },
});

const debouncedSave = debounce((dispatch: AppDispatch) => {
  dispatch(saveSettings({ showAlert: true }));
}, 1000);

const Preferences = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const settings = useSettings();
  const frontendConfig = useFrontendConfig();
  const instance = useInstance();
  const standalone = useAppSelector(isStandalone);

  const brandColor = (settings.theme?.brandColor ?? frontendConfig.brandColor) || '#d80482';

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    dispatch(changeSetting(path, event.target.value, { showAlert: true }));
  };

  const onSelectMultiple = (selectedList: string[], path: string[]) => {
    dispatch(
      changeSetting(
        path,
        selectedList.toSorted((a, b) => a.localeCompare(b)),
        { showAlert: true },
      ),
    );
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked));
  };

  const onBrandColorChange = (newBrandColor: string) => {
    if (newBrandColor === brandColor) return;

    const theme = settings.theme ?? frontendConfig.defaultSettings.theme;

    dispatch(
      changeSetting(
        ['theme'],
        {
          ...theme,
          brandColor: newBrandColor,
        },
        { showAlert: true, save: false },
      ),
    );

    debouncedSave(dispatch);
  };

  const onInterfaceSizeChange = (value: number) => {
    const theme = settings.theme ?? frontendConfig.defaultSettings.theme;

    dispatch(
      changeSetting(
        ['theme'],
        {
          ...theme,
          interfaceSize: INTERFACE_SIZES[value],
        },
        { showAlert: true, save: false },
      ),
    );
    debouncedSave(dispatch);
  };

  const onThemeReset = () => {
    dispatch(
      changeSetting(['themeMode'], frontendConfig.defaultSettings.themeMode, { save: false }),
    );
    dispatch(changeSetting(['theme'], frontendConfig.defaultSettings.theme, { showAlert: true }));
  };

  const displayMediaOptions = React.useMemo(
    () => ({
      default: intl.formatMessage(messages.displayPostsDefault),
      hide_all: intl.formatMessage(messages.displayPostsHideAll),
      show_all: intl.formatMessage(messages.displayPostsShowAll),
    }),
    [settings.locale],
  );

  const defaultPrivacyOptions = React.useMemo(
    () => ({
      public: intl.formatMessage(messages.privacyPublic),
      unlisted: intl.formatMessage(messages.privacyUnlisted),
      private: intl.formatMessage(messages.privacyFollowersOnly),
    }),
    [settings.locale],
  );

  const systemDarkThemePreferenceOptions = React.useMemo(
    () => ({
      dark: intl.formatMessage(messages.dark),
      black: intl.formatMessage(messages.black),
    }),
    [settings.locale],
  );

  const interfaceSizeValueText = React.useMemo(() => {
    const size = settings.theme?.interfaceSize ?? 'md';

    switch (size) {
      case 'sm':
        return intl.formatMessage(messages.interfaceSizeSmall);
      case 'lg':
        return intl.formatMessage(messages.interfaceSizeLarge);
      case 'xl':
        return intl.formatMessage(messages.interfaceSizeExtraLarge);
      default:
        return intl.formatMessage(messages.interfaceSizeMedium);
    }
  }, [settings.theme?.interfaceSize, settings.locale]);

  const defaultContentTypeOptions = React.useMemo(() => {
    const postFormats = instance.pleroma.metadata.post_formats;

    const options = Object.entries({
      'text/plain': intl.formatMessage(messages.contentTypePlaintext),
      'text/markdown': intl.formatMessage(messages.contentTypeMarkdown),
      'text/html': intl.formatMessage(messages.contentTypeHtml),
    }).filter(([key]) => postFormats.includes(key));

    if (postFormats.includes('text/markdown'))
      options.push(['wysiwyg', intl.formatMessage(messages.contentTypeWysiwyg)]);

    if (options.length > 1) return Object.fromEntries(options);
  }, [settings.locale]);

  return (
    <Form>
      <List>
        <ListItem
          label={
            <FormattedMessage
              id='home.column_settings.show_reblogs'
              defaultMessage='Show reposts in home timeline'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['timelines', 'home', 'shows', 'reblog']}
            defaultValue
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='home.column_settings.show_replies'
              defaultMessage='Show replies in home timeline'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['timelines', 'home', 'shows', 'reply']}
            defaultValue
            onChange={onToggleChange}
          />
        </ListItem>
      </List>

      <List>
        <ListItem label={<FormattedMessage id='preferences.fields.theme' defaultMessage='Theme' />}>
          <ThemeToggle />
        </ListItem>
        <PaletteListItem
          label={intl.formatMessage(messages.brandColor)}
          palette={colors(brandColor)}
          onChange={(palette) => {
            onBrandColorChange(palette['500']);
          }}
          allowTintChange={false}
        />
        <ListItem
          label={
            <div className='whitespace-nowrap'>
              <FormattedMessage
                id='preferences.fields.interface_size'
                defaultMessage='Interface size'
              />
            </div>
          }
        >
          <div className='flex w-full flex-col'>
            <StepSlider
              value={INTERFACE_SIZES.indexOf(settings.theme?.interfaceSize ?? 'md')}
              steps={4}
              onChange={onInterfaceSizeChange}
              aria-valuetext={interfaceSizeValueText}
            />
          </div>
        </ListItem>
        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.theme.display_background_gradient'
              defaultMessage='Display background gradient'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['theme', 'backgroundGradient']}
            defaultValue
            onChange={onToggleChange}
          />
        </ListItem>
        {settings.themeMode === 'system' && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.theme.dark_theme_preference_label'
                defaultMessage='Dark theme preference'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.theme.dark_theme_preference_hint'
                defaultMessage='Select dark theme to be used when theme is set to "System"'
              />
            }
          >
            <SelectDropdown
              className='max-w-[200px]'
              items={systemDarkThemePreferenceOptions}
              defaultValue={settings.theme?.systemDarkThemePreference ?? 'black'}
              onChange={(event) => {
                onSelectChange(event, ['theme', 'systemDarkThemePreference']);
              }}
            />
          </ListItem>
        )}
      </List>

      <HStack justifyContent='end'>
        <Button theme='secondary' onClick={onThemeReset}>
          <FormattedMessage id='preferences.fields.theme_reset' defaultMessage='Reset theme' />
        </Button>
      </HStack>

      <List>
        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.language_label'
              defaultMessage='Display language'
            />
          }
          hint={
            <FormattedMessage
              id='preferences.fields.language_hint'
              defaultMessage='You can help translating the {software} interface into your language on <link>Weblate</link>.'
              values={{
                software: sourceCode.displayName,
                link: (children: React.ReactNode) => (
                  <a
                    className='underline'
                    href='https://hosted.weblate.org/projects/pl-fe/pl-fe/'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {children}
                  </a>
                ),
              }}
            />
          }
        >
          <SelectDropdown
            className='max-w-[200px]'
            items={languages}
            defaultValue={settings.locale}
            onChange={(event) => {
              onSelectChange(event, ['locale']);
            }}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.spoilers_display_label'
              defaultMessage='Automatically expand text behind spoilers'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['displaySpoilers']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.media_display_label'
              defaultMessage='Sensitive content'
            />
          }
        >
          <SelectDropdown
            className='max-w-[200px]'
            items={displayMediaOptions}
            defaultValue={settings.displayMedia}
            onChange={(event) => {
              onSelectChange(event, ['displayMedia']);
            }}
          />
        </ListItem>

        {features.privacyScopes && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.privacy_label'
                defaultMessage='Default post privacy'
              />
            }
          >
            <SelectDropdown
              className='max-w-[200px]'
              items={defaultPrivacyOptions}
              defaultValue={settings.defaultPrivacy}
              onChange={(event) => {
                onSelectChange(event, ['defaultPrivacy']);
              }}
            />
          </ListItem>
        )}

        {features.richText && !!defaultContentTypeOptions && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.content_type_label'
                defaultMessage='Default post format'
              />
            }
          >
            <SelectDropdown
              className='max-w-[200px]'
              items={defaultContentTypeOptions}
              defaultValue={settings.defaultContentType}
              onChange={(event) => {
                onSelectChange(event, ['defaultContentType']);
              }}
            />
          </ListItem>
        )}

        {features.spoilers && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.preserve_spoilers_label'
                defaultMessage='Preserve content warning when replying'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['preserveSpoilers']}
              onChange={onToggleChange}
            />
          </ListItem>
        )}

        {features.createStatusExplicitAddressing && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.implicit_addressing_label'
                defaultMessage='Include mentions in post content when replying'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['forceImplicitAddressing']}
              onChange={onToggleChange}
            />
          </ListItem>
        )}

        <ListItem
          label={
            <FormattedMessage
              id='preferences.notifications.advanced'
              defaultMessage='Show all notification categories'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['notifications', 'quickFilter', 'advanced']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.demetricator_label'
              defaultMessage='Hide social media counters'
            />
          }
          hint={
            <FormattedMessage
              id='preferences.hints.demetricator'
              defaultMessage='Decrease social media anxiety by hiding all numbers from the site.'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['demetricator']}
            onChange={onToggleChange}
          />
        </ListItem>

        {features.emojiReacts && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.wrench_label'
                defaultMessage='Display wrench reaction button'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['showWrenchButton']}
              onChange={onToggleChange}
            />
          </ListItem>
        )}

        {features.emojiReacts && standalone && (
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.check_emoji_react_supports_label'
                defaultMessage='Check whether remote hosts supports emoji reactions when reacting'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.check_emoji_react_supports_hint'
                defaultMessage='This will expose your IP address to the instances you’re interacting with.'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['checkEmojiReactsSupport']}
              onChange={onToggleChange}
            />
          </ListItem>
        )}

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.disable_user_provided_media_label'
              defaultMessage='Do not display user-provided media'
            />
          }
          hint={
            <FormattedMessage
              id='preferences.fields.disable_user_provided_media_hint'
              defaultMessage='This will hide images, videos, and other media uploaded by users and display alternative text instead.'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['disableUserProvidedMedia']}
            onChange={onToggleChange}
          />
        </ListItem>
      </List>

      <List>
        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.boost_modal_label'
              defaultMessage='Show confirmation dialog before reposting'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['boostModal']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.delete_modal_label'
              defaultMessage='Show confirmation dialog before deleting a post'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['deleteModal']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.missing_description_modal_label'
              defaultMessage='Show confirmation dialog before sending a post without media descriptions'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['missingDescriptionModal']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.unfollow_modal_label'
              defaultMessage='Show confirmation dialog before unfollowing someone'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['unfollowModal']}
            onChange={onToggleChange}
          />
        </ListItem>
      </List>

      <List>
        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.auto_play_gif_label'
              defaultMessage='Auto-play animated GIFs'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['autoPlayGif']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.system_font_label'
              defaultMessage="Use system's default font"
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['systemFont']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.system_emoji_font_label'
              defaultMessage='Use system emoji font'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['systemEmojiFont']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.reduce_motion_label'
              defaultMessage='Reduce motion in animations'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['reduceMotion']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.underline_links_label'
              defaultMessage='Always underline links in posts'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['underlineLinks']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.autoload_timelines_label'
              defaultMessage='Automatically load new posts when scrolled to the top of the page'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['autoloadTimelines']}
            onChange={onToggleChange}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.autoload_more_label'
              defaultMessage='Automatically load more items when scrolled to the bottom of the page'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['autoloadMore']}
            onChange={onToggleChange}
          />
        </ListItem>
      </List>

      {instance.pleroma.metadata.post_formats.includes('text/x.misskeymarkdown') && (
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.render_mfm_label'
                defaultMessage='Render Misskey Flavored Markdown'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.render_mfm_hint'
                defaultMessage='MFM support is experimental, not all node types are supported.'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['renderMfm']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.render_advanced_mfm_label'
                defaultMessage='Enable advanced MFM'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['renderAdvancedMfm']}
              onChange={onToggleChange}
              disabled={!settings.renderMfm}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.render_animated_mfm_label'
                defaultMessage='Enable animated MFM'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['renderAnimatedMfm']}
              onChange={onToggleChange}
              disabled={!settings.renderMfm}
            />
          </ListItem>
        </List>
      )}

      {features.translations && (
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.auto_translate_label'
                defaultMessage='Automatically translate posts in unknown languages'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['autoTranslate']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            className='!overflow-visible'
            label={
              <FormattedMessage
                id='preferences.fields.known_languages_label'
                defaultMessage='Languages you know'
              />
            }
          >
            <Multiselect
              className='max-w-[200px]'
              items={languages}
              value={settings.knownLanguages as string[] | undefined}
              onChange={(selectedList) => {
                onSelectMultiple(selectedList, ['knownLanguages']);
              }}
              disabled={!settings.autoTranslate}
            />
          </ListItem>
        </List>
      )}

      <List>
        <ListItem
          label={
            <FormattedMessage
              id='preferences.fields.experimental_timeline_label'
              defaultMessage='Enable experimental timeline'
            />
          }
          hint={
            <FormattedMessage
              id='preferences.fields.experimental_timeline_hint'
              defaultMessage='It replaces the stable timeline experience and might not offer all features.'
            />
          }
        >
          <SettingToggle
            settings={settings}
            settingPath={['experimentalTimeline']}
            onChange={onToggleChange}
          />
        </ListItem>
      </List>
    </Form>
  );
};

export { Preferences as default, languages, type Language };
