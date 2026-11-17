import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { NotificationRequestsSettings } from '@/components/settings/notification-requests-settings';
import { List } from '@/components/ui/list';
import { useFeatures } from '@/contexts/current-account-context';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  hideBots: {
    id: 'preferences.notifications.hide_bots',
    defaultMessage: 'Filter notifications from automated accounts',
  },
  autoMarkRead: {
    id: 'preferences.notifications.auto_mark_read',
    defaultMessage: 'Mark notifications read automatically',
  },
});

const NotificationsSettingsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'notifications'>,
) => {
  const features = useFeatures();
  const intl = useIntl();
  const { update } = useSettingsActions();

  const hideBots = useSetting('notifications.hideBots');
  const autoMarkRead = useSetting('notifications.autoMarkRead');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.hideBots),
                active: hideBots,
                onPress: () => update('notifications.hideBots', !hideBots),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autoMarkRead),
                active: autoMarkRead,
                onPress: () => update('notifications.autoMarkRead', !autoMarkRead),
              },
            ],
          },
        ]}
      />
      {features.notificationsPolicy && <NotificationRequestsSettings />}
    </ScrollView>
  );
};
export { NotificationsSettingsScreen };
