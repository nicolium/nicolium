import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  heading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
});

const TimelinesPreferences: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
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
              settingPath={['timelines', 'home', 'showReblogs']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='home.column_settings.show_self_reblogs'
                defaultMessage='Show self-reposts in home timeline'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['timelines', 'home', 'showSelfReblogs']}
              defaultValue
              onChange={onToggleChange}
              disabled={settings.timelines?.home?.showReblogs === false}
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
              settingPath={['timelines', 'home', 'showReplies']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='home.column_settings.show_quotes'
                defaultMessage='Show quotes in home timeline'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['timelines', 'home', 'showQuotes']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='home.column_settings.show_direct'
                defaultMessage='Show direct messages in home timeline'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['timelines', 'home', 'showDirect']}
              defaultValue
              onChange={onToggleChange}
            />
          </ListItem>
        </List>
      </Form>
    </Column>
  );
};

export { TimelinesPreferences as default };
