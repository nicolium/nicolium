import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import TimelineIcon from 'lucide-react-native/icons/timeline';
import { BellSimpleIcon } from 'phosphor-react-native/src/icons/BellSimple';
import { ChatSlashIcon } from 'phosphor-react-native/src/icons/ChatSlash';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { HeartHalfIcon } from 'phosphor-react-native/src/icons/HeartHalf';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import { PaletteIcon } from 'phosphor-react-native/src/icons/Palette';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { SpeakerSimpleXIcon } from 'phosphor-react-native/src/icons/SpeakerSimpleX';
import { UserPlusIcon } from 'phosphor-react-native/src/icons/UserPlus';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { Header } from '@/components/ui/header';
import { List } from '@/components/ui/list';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useAuthStoreActions } from '@/stores/auth';
import { useSetting, useSettingsActions } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import { FollowRequestsScreen } from './follow-requests';
import { BlocksScreen, MutesScreen } from './mutes-blocks';

import type { RootStackParams, SettingsStackParams } from '../router';

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
  defaultPrivacy: {
    id: 'preferences.fields.privacy.label',
    defaultMessage: 'Default post privacy for new posts',
  },
  defaultContentType: {
    id: 'preferences.fields.content_type.label',
    defaultMessage: 'Default content type for new posts',
  },
  autosaveDrafts: {
    id: 'preferences.fields.autosave_drafts',
    defaultMessage: 'Automatically save posts as drafts while composing',
  },
  preserveSpoilers: {
    id: 'preferences.fields.preserve_spoilers.label',
    defaultMessage: 'Preserve content warning when replying',
  },
  forceImplicitAddressing: {
    id: 'preferences.fields.implicit_addressing.label',
    defaultMessage: 'Include mentions in post content when replying',
  },
  missingDescriptionModal: {
    id: 'preferences.fields.missing_description_modal.label',
    defaultMessage: 'Show confirmation dialog before sending a post without media descriptions',
  },
  missingLanguageModal: {
    id: 'preferences.fields.missing_language_modal.label',
    defaultMessage: 'Show confirmation dialog before sending a post without language set',
  },
  autoloadTimelines: {
    id: 'preferences.fields.autoload_timelines.label',
    defaultMessage: 'Automatically load new posts when scrolled to the top of the page',
  },
  autoloadMore: {
    id: 'preferences.fields.autoload_more.label',
    defaultMessage: 'Automatically load more items when scrolled to the bottom of the page',
  },
  boostModal: {
    id: 'preferences.fields.boost_modal.label',
    defaultMessage: 'Show confirmation dialog before reposting',
  },
  missingDescriptionBoostModal: {
    id: 'preferences.fields.missing_description_boost_modal.label',
    defaultMessage: 'Show confirmation dialog before reposting a post without media descriptions',
  },
  hideBots: {
    id: 'preferences.notifications.hide_bots',
    defaultMessage: 'Filter notifications from automated accounts',
  },
  autoMarkRead: {
    id: 'preferences.notifications.auto_mark_read',
    defaultMessage: 'Mark notifications read automatically',
  },
  enableLiquidGlass: {
    id: 'preferences.appearance.enable_liquid_glass',
    defaultMessage: 'Use native glass effect',
  },
  enableLiquidGlassDescription: {
    id: 'preferences.appearance.enable_liquid_glass.description',
    defaultMessage:
      'Turning this option off will reduce the amount of displayed glass effects, but won’t fully disable it.',
  },
  enableLiquidGlassDisabledDescription: {
    id: 'preferences.appearance.enable_liquid_glass.disabled_description',
    defaultMessage: 'how did you even get there lol ',
  },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  interactionPolicies: {
    id: 'column.interaction_policies',
    defaultMessage: 'Interaction policies',
  },
  mutedThreads: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
});

const ComposeSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'compose'>) => {
  const features = useFeatures();
  const intl = useIntl();
  const instance = useInstance();

  const autosaveDrafts = useSetting('compose.autosaveDrafts');
  const defaultPrivacy = useSetting('compose.defaultPrivacy');
  const defaultContentType = useSetting('compose.defaultContentType');
  const forceImplicitAddressing = useSetting('compose.forceImplicitAddressing');
  const missingDescriptionModal = useSetting('compose.missingDescriptionModal');
  const missingLanguageModal = useSetting('compose.missingLanguageModal');
  const preserveSpoilers = useSetting('compose.preserveSpoilers');

  const { update } = useSettingsActions();

  const contentTypes = useMemo(() => {
    const types = [
      { value: 'text/plain', label: intl.formatMessage(messages.contentTypePlaintext) },
    ];

    if (instance.pleroma.metadata.post_formats.includes('text/markdown')) {
      types.push({
        value: 'text/markdown',
        label: intl.formatMessage(messages.contentTypeMarkdown),
      });
    }

    if (instance.pleroma.metadata.post_formats.includes('text/html')) {
      types.push({
        value: 'text/html',
        label: intl.formatMessage(messages.contentTypeHtml),
      });
    }

    return types;
  }, [instance, intl]);

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'select',
                label: intl.formatMessage(messages.defaultPrivacy),
                active: defaultPrivacy,
                onChange: (value) => update('compose.defaultPrivacy', value),
                options: [
                  { value: 'public', label: intl.formatMessage(messages.privacyPublic) },
                  { value: 'unlisted', label: intl.formatMessage(messages.privacyUnlisted) },
                  { value: 'private', label: intl.formatMessage(messages.privacyFollowersOnly) },
                ],
              },
              {
                type: 'select',
                label: intl.formatMessage(messages.defaultContentType),
                active: defaultContentType,
                onChange: (value) => update('compose.defaultContentType', value),
                enabled: contentTypes.length > 1,
                options: contentTypes,
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autosaveDrafts),
                active: autosaveDrafts,
                onPress: () => update('compose.autosaveDrafts', !autosaveDrafts),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.preserveSpoilers),
                active: preserveSpoilers,
                onPress: () => update('compose.preserveSpoilers', !preserveSpoilers),
                enabled: features.spoilers,
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.forceImplicitAddressing),
                active: forceImplicitAddressing,
                onPress: () => update('compose.forceImplicitAddressing', !forceImplicitAddressing),
                enabled: features.createStatusExplicitAddressing,
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.missingDescriptionModal),
                active: missingDescriptionModal,
                onPress: () => update('compose.missingDescriptionModal', !missingDescriptionModal),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.missingLanguageModal),
                active: missingLanguageModal,
                onPress: () => update('compose.missingLanguageModal', !missingLanguageModal),
                enabled: features.postLanguages,
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

const TimelinesSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'timelines'>) => {
  const intl = useIntl();
  const { update } = useSettingsActions();

  const autoloadMore = useSetting('timelines.autoloadMore');
  const autoloadTimelines = useSetting('timelines.autoloadTimelines');
  const boostModal = useSetting('timelines.boostModal');
  const missingDescriptionBoostModal = useSetting('timelines.missingDescriptionBoostModal');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autoloadMore),
                active: autoloadMore,
                onPress: () => update('timelines.autoloadMore', !autoloadMore),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autoloadTimelines),
                active: autoloadTimelines,
                onPress: () => update('timelines.autoloadTimelines', !autoloadTimelines),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.boostModal),
                active: boostModal,
                onPress: () => update('timelines.boostModal', !boostModal),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.missingDescriptionBoostModal),
                active: missingDescriptionBoostModal,
                onPress: () =>
                  update('timelines.missingDescriptionBoostModal', !missingDescriptionBoostModal),
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

const NotificationsSettingsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'notifications'>,
) => {
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
    </ScrollView>
  );
};

const AppearanceSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'appearance'>) => {
  const intl = useIntl();
  const glassEffect = isGlassEffectAPIAvailable();

  const { update } = useSettingsActions();

  const enableLiquidGlass = useSetting('appearance.enableLiquidGlass');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.enableLiquidGlass),
                sublabel: intl.formatMessage(
                  glassEffect
                    ? messages.enableLiquidGlassDescription
                    : messages.enableLiquidGlassDisabledDescription,
                ),
                active: enableLiquidGlass,
                onPress: () => update('appearance.enableLiquidGlass', !enableLiquidGlass),
                disabled: !glassEffect,
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

const ContentSettingsScreen = ({
  navigation,
}: NativeStackScreenProps<SettingsStackParams, 'content'>) => {
  const intl = useIntl();
  const features = useFeatures();

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                icon: SpeakerSimpleXIcon,
                type: 'button',
                label: intl.formatMessage(messages.muted),
                onPress: () => navigation.navigate('mutes'),
              },
              {
                icon: ProhibitIcon,
                type: 'button',
                label: intl.formatMessage(messages.blocked),
                onPress: () => navigation.navigate('blocks'),
              },
              {
                icon: FunnelIcon,
                type: 'button',
                label: intl.formatMessage(messages.filters),
                onPress: () => navigation.navigate('filters'),
              },
              {
                icon: HeartHalfIcon,
                type: 'button',
                label: intl.formatMessage(messages.interactionPolicies),
                onPress: () => navigation.navigate('interaction_policies'),
                enabled: features.interactionRequests || features.quoteApprovalPolicies,
              },
              {
                icon: ChatSlashIcon,
                type: 'button',
                label: intl.formatMessage(messages.mutedThreads),
                onPress: () => navigation.navigate('muted_threads'),
                enabled: features.mutedThreads,
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

const SettingsScreen = ({ navigation }: NativeStackScreenProps<SettingsStackParams, 'index'>) => {
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
                onPress: () => signOut(),
                role: 'destructive',
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

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
    </SettingsStack.Navigator>
  );
};

export { SettingsStackScreen };
