import { Divider, List, SegmentedButtons, Switch, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Timeline as TimelineIcon } from 'lucide-react-native';
import {
  BellSimpleIcon,
  InfoIcon,
  NotePencilIcon,
  SignOutIcon,
  UserPlusIcon,
} from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { Header } from '@/components/ui/header';
import { iconHelper } from '@/components/ui/icon';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useAuthStoreActions } from '@/stores/auth';
import { useSetting, useSettingsActions } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import type { RootStackParams, SettingsStackParams } from '../router';

const messages = defineMessages({
  settingsHeading: { id: 'settings.settings', defaultMessage: 'Settings' },
  composeHeading: { id: 'preferences.heading.compose', defaultMessage: 'Compose settings' },
  timelinesHeading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
  notificationsHeading: {
    id: 'preferences.heading.notifications',
    defaultMessage: 'Notifications settings',
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
      <List.Section>
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.privacy.label'
              defaultMessage='Default post privacy for new posts'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <SegmentedButtons
              value={defaultPrivacy}
              onValueChange={(value) => update('compose.defaultPrivacy', value)}
              buttons={[
                { value: 'public', label: intl.formatMessage(messages.privacyPublic) },
                { value: 'unlisted', label: intl.formatMessage(messages.privacyUnlisted) },
                { value: 'private', label: intl.formatMessage(messages.privacyFollowersOnly) },
              ]}
              style={{ marginLeft: 16 }}
            />
          )}
          containerStyle={{ flexDirection: 'column', gap: 8 }}
        />
        {contentTypes.length > 1 && (
          <List.Item
            title={
              <FormattedMessage
                id='preferences.fields.content_type.label'
                defaultMessage='Default content type for new posts'
              />
            }
            titleNumberOfLines={0}
            right={() => (
              <SegmentedButtons
                value={defaultContentType}
                onValueChange={(value) => update('compose.defaultContentType', value)}
                buttons={contentTypes}
                style={{ marginLeft: 16 }}
              />
            )}
            containerStyle={{ flexDirection: 'column', gap: 8 }}
          />
        )}
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.autosave_drafts'
              defaultMessage='Automatically save posts as drafts while composing'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={autosaveDrafts}
              onValueChange={(value) => update('compose.autosaveDrafts', value)}
            />
          )}
          containerStyle={{ gap: 4, alignItems: 'center' }}
        />
        {features.spoilers && (
          <List.Item
            title={
              <FormattedMessage
                id='preferences.fields.preserve_spoilers.label'
                defaultMessage='Preserve content warning when replying'
              />
            }
            titleNumberOfLines={0}
            right={() => (
              <Switch
                value={preserveSpoilers}
                onValueChange={(value) => update('compose.preserveSpoilers', value)}
              />
            )}
            containerStyle={{ gap: 4, alignItems: 'center' }}
          />
        )}
        {features.createStatusExplicitAddressing && (
          <List.Item
            title={
              <FormattedMessage
                id='preferences.fields.implicit_addressing.label'
                defaultMessage='Include mentions in post content when replying'
              />
            }
            titleNumberOfLines={0}
            right={() => (
              <Switch
                value={forceImplicitAddressing}
                onValueChange={(value) => update('compose.forceImplicitAddressing', value)}
              />
            )}
            containerStyle={{ gap: 4, alignItems: 'center' }}
          />
        )}
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.missing_description_modal.label'
              defaultMessage='Show confirmation dialog before sending a post without media descriptions'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={missingDescriptionModal}
              onValueChange={(value) => update('compose.missingDescriptionModal', value)}
            />
          )}
          containerStyle={{ gap: 4, alignItems: 'center' }}
        />
        {features.postLanguages && (
          <List.Item
            title={
              <FormattedMessage
                id='preferences.fields.missing_language_modal.label'
                defaultMessage='Show confirmation dialog before sending a post without language set'
              />
            }
            titleNumberOfLines={0}
            right={() => (
              <Switch
                value={missingLanguageModal}
                onValueChange={(value) => update('compose.missingLanguageModal', value)}
              />
            )}
            containerStyle={{ gap: 4 }}
          />
        )}
      </List.Section>
    </ScrollView>
  );
};

const TimelinesSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'timelines'>) => {
  const { update } = useSettingsActions();

  const autoloadMore = useSetting('timelines.autoloadMore');
  const autoloadTimelines = useSetting('timelines.autoloadTimelines');
  const missingDescriptionBoostModal = useSetting('timelines.missingDescriptionBoostModal');

  return (
    <ScrollView>
      <List.Section>
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.autoload_timelines.label'
              defaultMessage='Automatically load new posts when scrolled to the top of the page'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={autoloadMore}
              onValueChange={(value) => update('timelines.autoloadMore', value)}
            />
          )}
          containerStyle={{ gap: 4, alignItems: 'center' }}
        />
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.autoload_more.label'
              defaultMessage='Automatically load more items when scrolled to the bottom of the page'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={autoloadTimelines}
              onValueChange={(value) => update('timelines.autoloadTimelines', value)}
            />
          )}
          containerStyle={{ gap: 4, alignItems: 'center' }}
        />
        <List.Item
          title={
            <FormattedMessage
              id='preferences.fields.missing_description_boost_modal.label'
              defaultMessage='Show confirmation dialog before reposting a post without media descriptions'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={missingDescriptionBoostModal}
              onValueChange={(value) => update('timelines.missingDescriptionBoostModal', value)}
            />
          )}
          containerStyle={{ gap: 4, alignItems: 'center' }}
        />
      </List.Section>
    </ScrollView>
  );
};

const NotificationsSettingsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'notifications'>,
) => {
  const { update } = useSettingsActions();

  const hideBots = useSetting('notifications.hideBots');
  const autoMarkRead = useSetting('notifications.autoMarkRead');

  return (
    <ScrollView>
      <List.Section>
        <List.Item
          title={
            <FormattedMessage
              id='preferences.notifications.hide_bots'
              defaultMessage='Filter notifications from automated accounts'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={hideBots}
              onValueChange={(value) => update('notifications.hideBots', value)}
            />
          )}
          containerStyle={{ gap: 4 }}
        />
        <List.Item
          title={
            <FormattedMessage
              id='preferences.notifications.auto_mark_read'
              defaultMessage='Mark notifications read automatically'
            />
          }
          titleNumberOfLines={0}
          right={() => (
            <Switch
              value={autoMarkRead}
              onValueChange={(value) => update('notifications.autoMarkRead', value)}
            />
          )}
          containerStyle={{ gap: 4 }}
        />
      </List.Section>
    </ScrollView>
  );
};

const SettingsScreen = ({ navigation }: NativeStackScreenProps<SettingsStackParams, 'index'>) => {
  const theme = useTheme();

  const { signOut } = useAuthStoreActions();
  const { openAccountSwitcher } = useUiStoreActions();

  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>
          <FormattedMessage id='settings.settings_header' defaultMessage='App settings' />
        </List.Subheader>
        <List.Item
          title={
            <FormattedMessage id='preferences.heading.compose' defaultMessage='Compose settings' />
          }
          left={(props) => <List.Icon {...props} icon={iconHelper(NotePencilIcon)} />}
          onPress={() => navigation.navigate('compose')}
        />
        <List.Item
          title={
            <FormattedMessage
              id='preferences.heading.timelines'
              defaultMessage='Timelines settings'
            />
          }
          left={(props) => <List.Icon {...props} icon={(props) => <TimelineIcon {...props} />} />}
          onPress={() => navigation.navigate('timelines')}
        />
        <List.Item
          title={
            <FormattedMessage
              id='preferences.heading.notifications'
              defaultMessage='Notifications settings'
            />
          }
          left={(props) => <List.Icon {...props} icon={iconHelper(BellSimpleIcon)} />}
          onPress={() => navigation.navigate('notifications')}
        />
        <List.Item
          title={
            <FormattedMessage
              id='settings.about'
              defaultMessage='About {app_name}'
              values={{ app_name: 'Micolium' }}
            />
          }
          left={(props) => <List.Icon {...props} icon={InfoIcon} />}
          onPress={() => navigation.navigate('about')}
        />
      </List.Section>
      <Divider />
      <List.Section>
        <List.Subheader>
          <FormattedMessage id='settings.accounts_header' defaultMessage='Accounts' />
        </List.Subheader>
        <List.Item
          title={
            <FormattedMessage
              id='settings.add_or_switch_accounts'
              defaultMessage='Add or switch accounts'
            />
          }
          left={(props) => <List.Icon {...props} icon={iconHelper(UserPlusIcon)} />}
          onPress={() => openAccountSwitcher()}
        />
        <List.Item
          title={<FormattedMessage id='settings.sign_out' defaultMessage='Log out' />}
          left={(props) => (
            <List.Icon {...props} color={theme.colors.error} icon={iconHelper(SignOutIcon)} />
          )}
          onPress={() => signOut()}
          titleStyle={{ color: theme.colors.error }}
        />
      </List.Section>
    </ScrollView>
  );
};

const SettingsStack = createNativeStackNavigator<SettingsStackParams>();

const SettingsStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'settings'>) => {
  const intl = useIntl();

  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name='index'
        component={SettingsScreen}
        options={{ header: Header, title: intl.formatMessage(messages.settingsHeading) }}
      />
      <SettingsStack.Screen
        name='compose'
        component={ComposeSettingsScreen}
        options={{ header: Header, title: intl.formatMessage(messages.composeHeading) }}
      />
      <SettingsStack.Screen
        name='timelines'
        component={TimelinesSettingsScreen}
        options={{ header: Header, title: intl.formatMessage(messages.timelinesHeading) }}
      />
      <SettingsStack.Screen
        name='notifications'
        component={NotificationsSettingsScreen}
        options={{ header: Header, title: intl.formatMessage(messages.notificationsHeading) }}
      />
    </SettingsStack.Navigator>
  );
};

export { SettingsStackScreen };
