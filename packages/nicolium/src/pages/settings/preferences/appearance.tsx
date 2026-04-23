import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting, saveSettings } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import StepSlider from '@/components/ui/step-slider';
import ThemeToggle from '@/features/ui/components/theme-toggle';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { PaletteListItem } from '@/pages/dashboard/theme-editor';
import { useDefaultSettings, useSettings } from '@/stores/settings';
import colors from '@/utils/colors';

import SettingToggle from '../components/setting-toggle';

const INTERFACE_SIZES = ['sm', 'md', 'lg', 'xl'] as const;

const messages = defineMessages({
  heading: { id: 'preferences.heading.appearance', defaultMessage: 'Appearance settings' },
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

const debouncedSave = debounce(() => {
  saveSettings({ showAlert: true });
}, 1000);

const AppearancePreferences: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();
  const defaultSettings = useDefaultSettings();
  const frontendConfig = useFrontendConfig();

  const brandColor = (settings.theme?.brandColor ?? frontendConfig.brandColor) || '#d80482';

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    changeSetting(path, event.target.value, { showAlert: true });
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  const onBrandColorChange = (newBrandColor: string) => {
    if (newBrandColor === brandColor) return;

    const theme = settings.theme ?? frontendConfig.defaultSettings.theme;

    changeSetting(
      ['theme'],
      {
        ...theme,
        brandColor: newBrandColor,
      },
      { showAlert: true, save: false },
    );

    debouncedSave();
  };

  const onInterfaceSizeChange = (value: number) => {
    const theme = settings.theme ?? frontendConfig.defaultSettings.theme;

    changeSetting(
      ['theme'],
      {
        ...theme,
        interfaceSize: INTERFACE_SIZES[value],
      },
      { showAlert: true, save: false },
    );
    debouncedSave();
  };

  const onThemeReset = () => {
    changeSetting(['themeMode'], defaultSettings.themeMode, { save: false });
    changeSetting(['theme'], defaultSettings.theme, { showAlert: true });
  };

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

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        <List>
          <ListItem
            label={<FormattedMessage id='preferences.fields.theme' defaultMessage='Theme' />}
          >
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

        <div className='flex justify-end'>
          <Button theme='secondary' onClick={onThemeReset}>
            <FormattedMessage id='preferences.fields.theme_reset' defaultMessage='Reset theme' />
          </Button>
        </div>

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
                id='preferences.fields.use_system_media_controls_label'
                defaultMessage='Use native media controls'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['useSystemMediaControls']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.display_mention_avatars'
                defaultMessage='Show avatars next to mentions'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['displayMentionAvatars']}
              onChange={onToggleChange}
            />
          </ListItem>
        </List>

        <List>
          <ListItem
            to='/settings/sidebar'
            label={
              <FormattedMessage
                id='preferences.fields.sidebar_items'
                defaultMessage='Customize sidebar items'
              />
            }
          />

          <ListItem
            to='/settings/status_actions'
            label={
              <FormattedMessage
                id='preferences.fields.status_actions_items'
                defaultMessage='Customize status actions'
              />
            }
          />
        </List>
      </Form>
    </Column>
  );
};

export { AppearancePreferences as default };
