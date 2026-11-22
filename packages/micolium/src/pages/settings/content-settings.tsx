import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { List } from '@/components/ui/list';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  useInAppBrowser: {
    id: 'preferences.general.use_in_app_browser',
    defaultMessage: 'Open external links in in-app browser',
  },
  displayTargetHost: {
    id: 'url_privacy.display_target_host',
    defaultMessage: 'Always display the domain external links lead to',
  },
  displayMedia: {
    id: 'preferences.fields.media_display.label',
    defaultMessage: 'Sensitive content',
  },
  displayMediaDefault: {
    id: 'preferences.fields.display_media.default',
    defaultMessage: 'Hide media from posts marked as sensitive',
  },
  displayMediaHideAll: {
    id: 'preferences.fields.display_media.hide_all',
    defaultMessage: 'Always hide media in posts',
  },
});
const ContentSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'content'>) => {
  const intl = useIntl();

  const { update } = useSettingsActions();

  const useInAppBrowser = useSetting('general.useInAppBrowser');
  const displayTargetHost = useSetting('content.displayTargetHost');
  const displayMedia = useSetting('content.displayMedia');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.useInAppBrowser),
                active: useInAppBrowser,
                onPress: () => update('general.useInAppBrowser', !useInAppBrowser),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.displayTargetHost),
                active: displayTargetHost,
                onPress: () => update('content.displayTargetHost', !displayTargetHost),
              },
              {
                type: 'select',
                label: intl.formatMessage(messages.displayMedia),
                active: displayMedia,
                onChange: (value: typeof displayMedia) => update('content.displayMedia', value),
                options: [
                  { value: 'default', label: intl.formatMessage(messages.displayMediaDefault) },
                  { value: 'hide_all', label: intl.formatMessage(messages.displayMediaHideAll) },
                ],
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { ContentSettingsScreen };
