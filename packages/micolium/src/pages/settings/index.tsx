import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Header } from '@/components/ui/header';

import { AppearanceSettingsScreen } from './appearance-settings';
import { ComposeSettingsScreen } from './compose-settings';
import { ContentSettingsScreen } from './content-settings';
import { FilterEditorScreen, FiltersScreen } from './filters';
import { FollowRequestsScreen } from './follow-requests';
import { FollowedTagsScreen } from './followed-tags';
import { MutedThreadsScreen } from './muted-threads';
import { BlocksScreen, MutesScreen } from './mutes-blocks';
import { NotificationsSettingsScreen } from './notifications-settings';
import { SettingsScreen } from './settings';
import { TimelinesSettingsScreen } from './timeline-settings';

import type { RootStackParams, SettingsStackParams } from '@/router/router';

const messages = defineMessages({
  settingsHeading: { id: 'settings.settings', defaultMessage: 'Settings' },
  composeHeading: { id: 'preferences.heading.compose', defaultMessage: 'Compose settings' },
  timelinesHeading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
  notificationsHeading: {
    id: 'preferences.heading.notifications',
    defaultMessage: 'Notifications settings',
  },
  appearanceHeading: {
    id: 'preferences.heading.appearance',
    defaultMessage: 'Appearance settings',
  },
  aboutHeading: {
    id: 'preferences.heading.about',
    defaultMessage: 'About {app_name}',
  },
  contentHeading: { id: 'preferences.heading.content', defaultMessage: 'Content and filtering' },
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  blocked: { id: 'column.blocks.long', defaultMessage: 'Blocked accounts' },
  muted: { id: 'column.mutes.long', defaultMessage: 'Muted accounts' },
  settingsHeader: { id: 'settings.settings_header', defaultMessage: 'App settings' },
  accountHeader: { id: 'settings.account_header', defaultMessage: 'Account settings' },
  accountsHeader: { id: 'settings.accounts_header', defaultMessage: 'Accounts' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  interactionPolicies: {
    id: 'column.interaction_policies',
    defaultMessage: 'Interaction policies',
  },
  mutedThreads: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
  followedTags: { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
  editFilter: { id: 'column.filters.edit', defaultMessage: 'Edit filter' },
  newFilter: { id: 'column.filters.add_new', defaultMessage: 'Add new filter' },
});

const SettingsStack = createNativeStackNavigator<SettingsStackParams>();

const SettingsStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'settings'>) => {
  const intl = useIntl();

  return (
    <SettingsStack.Navigator screenOptions={{ header: Header }}>
      <SettingsStack.Screen
        name='index'
        component={SettingsScreen}
        options={{ title: intl.formatMessage(messages.settingsHeading) }}
      />
      <SettingsStack.Screen
        name='compose'
        component={ComposeSettingsScreen}
        options={{ title: intl.formatMessage(messages.composeHeading) }}
      />
      <SettingsStack.Screen
        name='timelines'
        component={TimelinesSettingsScreen}
        options={{ title: intl.formatMessage(messages.timelinesHeading) }}
      />
      <SettingsStack.Screen
        name='notifications'
        component={NotificationsSettingsScreen}
        options={{ title: intl.formatMessage(messages.notificationsHeading) }}
      />
      <SettingsStack.Screen
        name='appearance'
        component={AppearanceSettingsScreen}
        options={{ title: intl.formatMessage(messages.appearanceHeading) }}
      />
      <SettingsStack.Screen
        name='content'
        component={ContentSettingsScreen}
        options={{ title: intl.formatMessage(messages.contentHeading) }}
      />
      <SettingsStack.Screen
        name='follow_requests'
        component={FollowRequestsScreen}
        options={{ title: intl.formatMessage(messages.followRequests) }}
      />
      <SettingsStack.Screen
        name='blocks'
        component={BlocksScreen}
        options={{ title: intl.formatMessage(messages.blocked) }}
      />
      <SettingsStack.Screen
        name='mutes'
        component={MutesScreen}
        options={{ title: intl.formatMessage(messages.muted) }}
      />
      <SettingsStack.Screen
        name='filters'
        component={FiltersScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name='filter'
        component={FilterEditorScreen}
        options={({ route }) => ({
          title: intl.formatMessage(route.params?.id ? messages.editFilter : messages.newFilter),
        })}
      />
      <SettingsStack.Screen
        name='muted_threads'
        component={MutedThreadsScreen}
        options={{ title: intl.formatMessage(messages.mutedThreads) }}
      />
      <SettingsStack.Screen
        name='followed_tags'
        component={FollowedTagsScreen}
        options={{ title: intl.formatMessage(messages.followedTags) }}
      />
    </SettingsStack.Navigator>
  );
};

export { SettingsStackScreen };
