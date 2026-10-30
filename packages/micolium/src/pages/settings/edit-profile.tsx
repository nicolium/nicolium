import { Appbar, List as PaperList, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { pick } from 'lodash-es';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { type CredentialAccount, GOTOSOCIAL, type UpdateCredentialsParams } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { List } from '@/components/ui/list';
import { useClient, useFeatures, useInstance } from '@/contexts/current-account-context';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { getSegmentedMenuStyles } from '@/utils/themes';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  heading: { id: 'settings.edit_profile', defaultMessage: 'Edit profile' },
  displayNameLabel: {
    id: 'edit_profile.fields.display_name.label',
    defaultMessage: 'Display name',
  },
  displayNamePlaceholder: {
    id: 'edit_profile.fields.display_name.placeholder',
    defaultMessage: 'Name',
  },
  bioLabel: {
    id: 'edit_profile.fields.bio.label',
    defaultMessage: 'Bio',
  },
  bioPlaceholder: {
    id: 'edit_profile.fields.bio.placeholder',
    defaultMessage: 'Tell us about yourself.',
  },
  locationLabel: {
    id: 'edit_profile.fields.location.label',
    defaultMessage: 'Location',
  },
  locationPlaceholder: {
    id: 'edit_profile.fields.location.placeholder',
    defaultMessage: 'Location',
  },
  lockedLabel: { id: 'edit_profile.fields.locked.label', defaultMessage: 'Lock account' },
  lockedHint: {
    id: 'edit_profile.hints.locked',
    defaultMessage: 'Requires you to manually approve followers',
  },
  hideNetworkLabel: {
    id: 'edit_profile.fields.hide_network.label',
    defaultMessage: 'Hide network',
  },
  hideNetworkHint: {
    id: 'edit_profile.hints.hide_network',
    defaultMessage: 'Who you follow and who follows you will not be shown on your profile',
  },
  botLabel: { id: 'edit_profile.fields.bot.label', defaultMessage: 'This is a bot account' },
  botHint: {
    id: 'edit_profile.hints.bot',
    defaultMessage: 'This account mainly performs automated actions and might not be monitored',
  },
  discoverableLabel: {
    id: 'edit_profile.fields.discoverable.label',
    defaultMessage: 'Allow account discovery',
  },
  discoverableHint: {
    id: 'edit_profile.hints.discoverable',
    defaultMessage: 'Display account in profile directory and allow indexing by external services',
  },
  rssLabel: {
    id: 'edit_profile.fields.rss.label',
    defaultMessage: 'Enable RSS feed for public posts',
  },
  isCatLabel: { id: 'edit_profile.fields.is_cat.label', defaultMessage: 'The user is a cat' },
  isCatHint: { id: 'edit_profile.hints.is_cat', defaultMessage: 'Mark this account as a cat.' },
  speakAsCatLabel: {
    id: 'edit_profile.fields.speak_as_cat.label',
    defaultMessage: 'The user speaks as a cat',
  },
  speakAsCatHint: {
    id: 'edit_profile.hints.speak_as_cat',
    defaultMessage: 'Your posts will get nyanified.',
  },
  biteControlsLabel: {
    id: 'preferences.fields.bite_controls.label',
    defaultMessage: 'Allow bites from',
  },
  biteControlsPublic: { id: 'edit_profile.fields.bite_controls.public', defaultMessage: 'Anybody' },
  biteControlsFollowers: {
    id: 'edit_profile.fields.bite_controls.followers',
    defaultMessage: 'Followers',
  },
  biteControlsNone: { id: 'edit_profile.fields.bite_controls.none', defaultMessage: 'Nobody' },
  webLayoutLabel: {
    id: 'preferences.fields.web_layout.label',
    defaultMessage: 'Layout of the web view of your profile',
  },
  webLayoutMicroblog: {
    id: 'edit_profile.fields.web_layout.microblog',
    defaultMessage: 'Classic microblog layout',
  },
  webLayoutGallery: {
    id: 'edit_profile.fields.web_layout.gallery',
    defaultMessage: 'Media-only gallery layout',
  },
  webVisibilityLabel: {
    id: 'preferences.fields.web_visibility.label',
    defaultMessage: 'Visibility level of posts displayed on your profile',
  },
  webVisibilityPublic: {
    id: 'edit_profile.fields.web_visibility.public',
    defaultMessage: 'Show public posts only',
  },
  webVisibilityUnlisted: {
    id: 'edit_profile.fields.web_visibility.unlisted',
    defaultMessage: 'Show public and unlisted posts',
  },
  webVisibilityNone: {
    id: 'edit_profile.fields.web_visibility.none',
    defaultMessage: 'Show no posts',
  },
  webIncludeBoostsLabel: {
    id: 'preferences.fields.web_include_boosts.label',
    defaultMessage: 'Include reposts in web view',
  },
  webIncludeBoostsHint: {
    id: 'preferences.hints.web_include_boosts',
    defaultMessage: 'Show reposts created by the account on the web view of your profile',
  },
  mentionPolicyLabel: {
    id: 'preferences.fields.mention_policy.label',
    defaultMessage: 'Accept mentions from',
  },
  mentionPolicyHint: {
    id: 'preferences.hints.mention_policy',
    defaultMessage: 'Applies to direct messages and public posts',
  },
  mentionPolicyNone: { id: 'edit_profile.fields.mention_policy.none', defaultMessage: 'Everybody' },
  mentionPolicyOnlyKnown: {
    id: 'edit_profile.fields.mention_policy.only_known',
    defaultMessage: 'Everybody except new accounts',
  },
  mentionPolicyOnlyContacts: {
    id: 'edit_profile.fields.mention_policy.only_contacts',
    defaultMessage: 'People I follow and my followers',
  },
  strangerNotificationsLabel: {
    id: 'edit_profile.fields.stranger_notifications.label',
    defaultMessage: 'Block notifications from strangers',
  },
  strangerNotificationsHint: {
    id: 'edit_profile.hints.stranger_notifications',
    defaultMessage: 'Only show notifications from people you follow',
  },
  hideNotificationContentLabel: {
    id: 'edit_profile.fields.hide_notification_content.label',
    defaultMessage: 'Hide notification content in push notifications',
  },
  customCSSLabel: { id: 'edit_profile.fields.custom_css.label', defaultMessage: 'Custom CSS' },
  customCSSRemainingCharacters: {
    id: 'edit_profile.custom_css.remaining_characters',
    defaultMessage: '{remaining, plural, one {# character} other {# characters}} remaining',
  },
  success: {
    id: 'edit_profile.success',
    defaultMessage: 'Profile saved',
  },
  error: { id: 'edit_profile.error', defaultMessage: 'Failed to update profile' },
  backButtonConfirmationTitle: {
    id: 'edit_profile.back_confirmation.title',
    defaultMessage: 'You have made unsaved changes',
  },
  backButtonConfirmationMessage: {
    id: 'edit_profile.back_confirmation.message',
    defaultMessage: 'Are you sure you want to discard the changes?',
  },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  backButtonConfirmationConfirm: {
    id: 'edit_profile.back_confirmation.confirm',
    defaultMessage: 'Discard',
  },
});

/**
 * Whether the user is hiding their follows and/or followers.
 * Pleroma's config is granular, but we simplify it into one setting.
 */
const hidesNetwork = ({ __meta }: Pick<CredentialAccount, '__meta'>): boolean =>
  Boolean(
    __meta.pleroma?.hide_followers &&
    __meta.pleroma?.hide_follows &&
    __meta.pleroma?.hide_followers_count &&
    __meta.pleroma?.hide_follows_count,
  );

/** Convert an account into an update_credentials request object. */
const accountToCredentials = (account: CredentialAccount): UpdateCredentialsParams => {
  const hideNetwork = hidesNetwork(account);

  return {
    ...pick(account, [
      'birthday',
      'bot',
      'custom_css',
      'discoverable',
      'display_name',
      'locked',
      'location',
      'avatar_description',
      'header_description',
      'enable_rss',
      'hide_collections',
      'is_cat',
      'speak_as_cat',
      'mention_policy',
      'bite_controls',
    ]),
    ...pick(account.source, ['note', 'web_include_boosts', 'web_layout', 'web_visibility']),
    fields_attributes: [...(account.__meta.source?.fields ?? [])],
    stranger_notifications:
      account.__meta.pleroma?.notification_settings?.block_from_strangers === true,
    hide_followers: hideNetwork,
    hide_follows: hideNetwork,
    hide_followers_count: hideNetwork,
    hide_follows_count: hideNetwork,
  };
};

const EditProfileScreen = ({
  navigation,
}: NativeStackScreenProps<SettingsStackParams, 'edit_profile'>) => {
  const intl = useIntl();
  const theme = useTheme();
  const client = useClient();
  const features = useFeatures();
  const instance = useInstance();

  const { mutate: updateCredentials } = useUpdateCredentials();

  const [data, setData] = React.useState<UpdateCredentialsParams>({});
  const [isLoading, setLoading] = React.useState(true);
  const [muteStrangers, setMuteStrangers] = React.useState(false);
  const [hideNotificationContent, setHideNotificationContent] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [customCSSEditorExpanded, setCustomCSSEditorExpanded] = React.useState(false);

  React.useEffect(() => {
    client.settings
      .verifyCredentials()
      .then((credentialAccount) => {
        const credentials = accountToCredentials(credentialAccount);
        const strangerNotifications =
          credentialAccount.__meta.pleroma?.notification_settings?.block_from_strangers === true;
        setData(credentials);
        setMuteStrangers(strangerNotifications);
        setHideNotificationContent(
          credentialAccount.__meta.pleroma?.hide_notification_content ?? false,
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    const onConfirm = () => {
      const promises = [];

      const { fields_attributes, ...rest } = data;
      const params: UpdateCredentialsParams = {
        ...rest,
      };

      if (fields_attributes?.length === 0)
        params.fields_attributes = { '0': { name: '', value: '' } };
      else if (fields_attributes) {
        const padLength = fields_attributes.length.toString().length;
        params.fields_attributes = Object.fromEntries(
          fields_attributes.map(({ name, value }, i) => [
            i.toString().padStart(padLength, '0'),
            { name, value },
          ]),
        );
      }
      // if (header.file !== null) params.header = header.file ?? '';
      // if (avatar.file !== null) params.avatar = avatar.file ?? '';

      if (!instance.configuration.accounts?.allow_custom_css) delete params.custom_css;

      promises.push(updateCredentials(params as any));

      if (features.muteStrangers) {
        promises.push(
          client.settings
            .updateNotificationSettings({
              block_from_strangers: muteStrangers,
              hide_notification_contents: hideNotificationContent,
            })
            .catch(console.error),
        );
      }

      setLoading(true);

      Promise.all(promises)
        .then(() => {
          setLoading(false);
          setIsChanged(false);
          toast.success(intl.formatMessage(messages.success));
        })
        .catch(() => {
          setLoading(false);
          toast.error(intl.formatMessage(messages.error));
        });
    };

    // const missingAvatarDescription =
    //   features.accountAvatarDescription && (avatar.src || avatar.file) && !data.avatar_description;
    // const missingHeaderDescription =
    //   features.accountAvatarDescription && (header.src || header.file) && !data.header_description;

    // if (
    //   settings.missingDescriptionModal &&
    //   (missingAvatarDescription || missingHeaderDescription)
    // ) {
    //   openModal('CONFIRM', {
    //     heading: (
    //       <FormattedMessage
    //         id='confirmations.edit_profile.missing_description.heading'
    //         defaultMessage='Missing description'
    //       />
    //     ),
    //     message:
    //       missingAvatarDescription && missingHeaderDescription ? (
    //         <FormattedMessage
    //           id='confirmations.edit_profile.missing_description.message'
    //           defaultMessage='You have not entered a description for your avatar and header. Continue anyway?'
    //         />
    //       ) : missingAvatarDescription ? (
    //         <FormattedMessage
    //           id='confirmations.edit_profile.missing_description.avatar'
    //           defaultMessage='You have not entered a description for your avatar. Continue anyway?'
    //         />
    //       ) : (
    //         <FormattedMessage
    //           id='confirmations.edit_profile.missing_description.header'
    //           defaultMessage='You have not entered a description for your header. Continue anyway?'
    //         />
    //       ),
    //     confirm: intl.formatMessage(messages.missingDescriptionConfirm),
    //     onConfirm,
    //   });
    // } else {
    onConfirm();
    // }
  };

  /** Set a single key in the request data. */
  const updateData = (key: string, value: any) => {
    setIsChanged(true);
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleFieldChange =
    <T = any,>(key: keyof UpdateCredentialsParams) =>
    (value: T) => {
      updateData(key, value);
    };

  const handleToggle = (key: keyof UpdateCredentialsParams) => () => {
    updateData(key, !data[key]);
  };

  const handleTextChange = (key: keyof UpdateCredentialsParams) => (value: string) => {
    updateData(key, value);
  };

  const handleBirthdayChange = (date: string) => {
    updateData('birthday', date);
  };

  const hideNetwork =
    features.version.software === GOTOSOCIAL
      ? !!data.hide_collections
      : !!(
          data.hide_followers &&
          data.hide_follows &&
          data.hide_followers_count &&
          data.hide_follows_count
        );

  const handleHideNetworkChange = () => {
    const hide = !hideNetwork;
    setData((prevData) => ({
      ...prevData,
      ...(features.version.software === GOTOSOCIAL
        ? { hide_collections: hide }
        : {
            hide_followers: hide,
            hide_follows: hide,
            hide_followers_count: hide,
            hide_follows_count: hide,
          }),
    }));
  };

  const handleBackButton = () => {
    if (isChanged) {
      return Alert.alert(
        intl.formatMessage(messages.backButtonConfirmationTitle),
        intl.formatMessage(messages.backButtonConfirmationMessage),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.backButtonConfirmationConfirm),
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
    navigation.goBack();
  };

  const customCSSField =
    instance.configuration.accounts?.allow_custom_css &&
    (() => (
      <TextInput
        variant='outlined'
        multiline
        numberOfLines={6}
        style={{ minHeight: 128 }}
        value={data.custom_css}
        onChangeText={handleTextChange('custom_css')}
        supportingText={intl.formatMessage(messages.customCSSRemainingCharacters, {
          remaining: 5000 - (data.custom_css ?? '').length,
        })}
        autoCorrect={false}
      />
    ));

  return (
    <>
      <Appbar.Header
        mode='small'
        style={{
          backgroundColor: theme.colors.surfaceContainer,
        }}
      >
        <HeaderBackButton onPress={handleBackButton} />
        <Appbar.Content title={intl.formatMessage(messages.heading)} />
        <HeaderIconButton icon={CheckIcon} disabled={isLoading} onPress={handleSubmit} />
      </Appbar.Header>
      <ScrollView>
        <View style={{ padding: 16, paddingBottom: 0, gap: 12 }}>
          <TextInput
            variant='outlined'
            label={intl.formatMessage(messages.displayNameLabel)}
            placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
            value={data.display_name}
            onChangeText={handleTextChange('display_name')}
          />

          <TextInput
            variant='outlined'
            multiline
            numberOfLines={6}
            style={{ minHeight: 128 }}
            label={intl.formatMessage(messages.bioLabel)}
            placeholder={intl.formatMessage(messages.bioPlaceholder)}
            value={data.note}
            onChangeText={handleTextChange('note')}
          />

          {features.accountLocation && (
            <TextInput
              variant='outlined'
              label={intl.formatMessage(messages.locationLabel)}
              placeholder={intl.formatMessage(messages.locationPlaceholder)}
              value={data.location}
              onChangeText={handleTextChange('location')}
            />
          )}
        </View>

        <List
          sections={[
            {
              items: [
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.lockedLabel),
                  sublabel: intl.formatMessage(messages.lockedHint),
                  active: !!data.locked,
                  onPress: handleToggle('locked'),
                  enabled: features.followRequests,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.hideNetworkLabel),
                  sublabel: intl.formatMessage(messages.hideNetworkHint),
                  active: hideNetwork,
                  onPress: handleHideNetworkChange,
                  enabled: features.hideNetwork,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.botLabel),
                  sublabel: intl.formatMessage(messages.botHint),
                  active: !!data.bot,
                  onPress: handleToggle('bot'),
                  enabled: features.bots,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.discoverableLabel),
                  sublabel: intl.formatMessage(messages.discoverableHint),
                  active: !!data.discoverable,
                  onPress: handleToggle('discoverable'),
                  enabled: features.accountDiscoverability,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.rssLabel),
                  active: !!data.enable_rss,
                  onPress: handleToggle('enable_rss'),
                  enabled: features.rssFeeds && features.version.software === GOTOSOCIAL,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.isCatLabel),
                  sublabel: intl.formatMessage(messages.isCatHint),
                  active: !!data.is_cat,
                  onPress: handleToggle('is_cat'),
                  enabled: features.accountIsCat,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.speakAsCatLabel),
                  sublabel: intl.formatMessage(messages.speakAsCatHint),
                  active: !!data.speak_as_cat,
                  onPress: handleToggle('speak_as_cat'),
                  enabled: features.accountIsCat,
                },
                {
                  type: 'select',
                  label: intl.formatMessage(messages.biteControlsLabel),
                  active: data.bite_controls ?? 'none',
                  onChange: handleFieldChange('bite_controls'),
                  options: [
                    { value: 'public', label: intl.formatMessage(messages.biteControlsPublic) },
                    {
                      value: 'followers',
                      label: intl.formatMessage(messages.biteControlsFollowers),
                    },
                    { value: 'none', label: intl.formatMessage(messages.biteControlsNone) },
                  ],
                  enabled: features.biteControls,
                },
                {
                  type: 'select',
                  label: intl.formatMessage(messages.webLayoutLabel),
                  active: data.web_layout,
                  onChange: handleFieldChange('web_layout'),
                  options: [
                    { value: 'microblog', label: intl.formatMessage(messages.webLayoutMicroblog) },
                    { value: 'gallery', label: intl.formatMessage(messages.webLayoutGallery) },
                  ],
                  enabled: features.accountWebLayout,
                },
                {
                  type: 'select',
                  label: intl.formatMessage(messages.webVisibilityLabel),
                  active: data.web_visibility,
                  onChange: handleFieldChange('web_visibility'),
                  options: [
                    { value: 'public', label: intl.formatMessage(messages.webVisibilityPublic) },
                    {
                      value: 'unlisted',
                      label: intl.formatMessage(messages.webVisibilityUnlisted),
                    },
                    { value: 'none', label: intl.formatMessage(messages.webVisibilityNone) },
                  ],
                  enabled: features.accountWebVisibility,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.webIncludeBoostsLabel),
                  sublabel: intl.formatMessage(messages.webIncludeBoostsHint),
                  active: !!data.web_include_boosts,
                  onPress: handleToggle('web_include_boosts'),
                  enabled: features.accountWebIncludeBoosts,
                },
                {
                  type: 'select',
                  label: intl.formatMessage(messages.mentionPolicyLabel),
                  sublabel: intl.formatMessage(messages.mentionPolicyHint),
                  active: data.mention_policy,
                  onChange: handleFieldChange('mention_policy'),
                  options: [
                    { value: 'none', label: intl.formatMessage(messages.mentionPolicyNone) },
                    {
                      value: 'only_known',
                      label: intl.formatMessage(messages.mentionPolicyOnlyKnown),
                    },
                    {
                      value: 'only_contacts',
                      label: intl.formatMessage(messages.mentionPolicyOnlyContacts),
                    },
                  ],
                  enabled: features.accountMentionPolicy,
                },
              ],
            },
            {
              items: [
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.strangerNotificationsLabel),
                  sublabel: intl.formatMessage(messages.strangerNotificationsHint),
                  active: muteStrangers,
                  onPress: () => setMuteStrangers(!muteStrangers),
                  enabled: features.muteStrangers,
                },
                {
                  type: 'toggle',
                  label: intl.formatMessage(messages.hideNotificationContentLabel),
                  active: hideNotificationContent,
                  onPress: () => setHideNotificationContent(!hideNotificationContent),
                  enabled: features.muteStrangers,
                },
              ],
            },
          ]}
        />

        {customCSSField && (
          <PaperList.Section>
            <PaperList.Accordion
              title={intl.formatMessage(messages.customCSSLabel)}
              style={[
                getSegmentedMenuStyles(theme, false, 0, customCSSEditorExpanded ? 2 : 1),
                { marginHorizontal: 16, marginBottom: customCSSEditorExpanded ? 2 : 0 },
              ]}
              expanded={customCSSEditorExpanded}
              onPress={() => setCustomCSSEditorExpanded((value) => !value)}
            >
              <PaperList.Item
                title={customCSSField}
                style={[getSegmentedMenuStyles(theme, false, 1, 2), { marginHorizontal: 16 }]}
              />
            </PaperList.Accordion>
          </PaperList.Section>
        )}
      </ScrollView>
    </>
  );
};

export { EditProfileScreen };
