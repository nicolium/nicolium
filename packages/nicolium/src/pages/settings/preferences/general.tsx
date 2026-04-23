import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import { useFeatures } from '@/hooks/use-features';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useSettings } from '@/stores/settings';
import sourceCode from '@/utils/code';

import MessagesSettings from '../components/messages-settings';
import { languages } from '../components/preferences';

const messages = defineMessages({
  heading: { id: 'preferences.heading.general', defaultMessage: 'General settings' },
});

const GeneralPreferences: React.FC = () => {
  const features = useFeatures();
  const intl = useIntl();
  const settings = useSettings();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    changeSetting(path, event.target.value, { showAlert: true });
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        {!features.frontendConfigurations && features.notes && (
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.store_settings_in_notes'
                  defaultMessage='Store settings in account notes (recommended)'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.store_settings_in_notes_hint'
                  defaultMessage='It allows you to sync your settings across devices. They are only visible to you.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['storeSettingsInNotes']}
                defaultValue
                onChange={onToggleChange}
              />
            </ListItem>
          </List>
        )}

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
                      href='https://hosted.weblate.org/projects/nicolium/nicolium/'
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
        </List>

        <List>
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.remember_timeline_position_label'
                defaultMessage='Remember position of home timeline'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.remember_timeline_position_hint'
                defaultMessage='When enabled, the app will return to the place you left off in the home timeline last time you visited it.'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['rememberTimelinePosition']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.compose_in_timelines_label'
                defaultMessage='Display post composer in timelines'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['composeInTimelines']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>

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
        </List>

        <List>
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
        </List>

        {features.chats && <MessagesSettings />}
      </Form>
    </Column>
  );
};

export { GeneralPreferences as default };
