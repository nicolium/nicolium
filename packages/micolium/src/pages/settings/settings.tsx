import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import TimelineIcon from 'lucide-react-native/icons/timeline';
import { BellSimpleIcon } from 'phosphor-react-native/src/icons/BellSimple';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import { PaletteIcon } from 'phosphor-react-native/src/icons/Palette';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { UserPlusIcon } from 'phosphor-react-native/src/icons/UserPlus';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';
import { toast } from 'sonner-native';

import { List } from '@/components/ui/list';
import { useFeatures } from '@/contexts/current-account-context';
import { useAuthStoreActions } from '@/stores/auth';
import { useUiStoreActions } from '@/stores/ui';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
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
  addOrSwitchAccounts: {
    id: 'settings.add_or_switch_accounts',
    defaultMessage: 'Add or switch accounts',
  },
  signOut: { id: 'settings.sign_out', defaultMessage: 'Log out' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  mutedThreads: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
  followedTags: { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
});

const SettingsScreen = ({ navigation }: NativeStackScreenProps<SettingsStackParams, 'index'>) => {
  const features = useFeatures();
  const intl = useIntl();
  const glassEffect = isGlassEffectAPIAvailable();

  const { signOut } = useAuthStoreActions();
  const { openAccountSwitcher } = useUiStoreActions();

  return (
    <ScrollView>
      <List
        sections={[
          {
            subheader: intl.formatMessage(messages.settingsHeader),
            items: [
              {
                icon: NotePencilIcon,
                type: 'button',
                label: intl.formatMessage(messages.composeHeading),
                onPress: () => navigation.navigate('compose'),
              },
              {
                icon: TimelineIcon,
                type: 'button',
                label: intl.formatMessage(messages.timelinesHeading),
                onPress: () => navigation.navigate('timelines'),
              },
              {
                icon: BellSimpleIcon,
                type: 'button',
                label: intl.formatMessage(messages.notificationsHeading),
                onPress: () => navigation.navigate('notifications'),
              },
              {
                icon: PaletteIcon,
                type: 'button',
                label: intl.formatMessage(messages.appearanceHeading),
                onPress: () => navigation.navigate('appearance'),
                enabled: glassEffect,
              },
              {
                icon: InfoIcon,
                type: 'button',
                label: intl.formatMessage(messages.aboutHeading, { app_name: 'micolium' }),
                onPress: () => navigation.navigate('about'),
              },
            ],
          },
          {
            subheader: intl.formatMessage(messages.accountHeader),
            items: [
              {
                icon: FunnelIcon,
                type: 'button',
                label: intl.formatMessage(messages.contentHeading),
                onPress: () => navigation.navigate('content'),
              },
              {
                icon: HashIcon,
                type: 'button',
                label: intl.formatMessage(messages.followedTags),
                onPress: () => navigation.navigate('followed_tags'),
                enabled: features.followedHashtagsList,
              },
            ],
          },
          {
            subheader: intl.formatMessage(messages.accountsHeader),
            items: [
              {
                icon: UserPlusIcon,
                type: 'button',
                label: intl.formatMessage(messages.addOrSwitchAccounts),
                onPress: () => openAccountSwitcher(),
              },
              {
                icon: SignOutIcon,
                type: 'button',
                label: intl.formatMessage(messages.signOut),
                onPress: () => {
                  signOut();
                  navigation.navigate('home');
                  toast.info(intl.formatMessage(messages.loggedOut));
                },
                role: 'destructive',
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { SettingsScreen };
