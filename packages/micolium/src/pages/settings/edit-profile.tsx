import {
  Appbar,
  Button,
  IconButton,
  List as PaperList,
  TextInput,
  useTheme,
} from '@mkljczk/react-native-paper';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { pick } from 'lodash-es';
import { create } from 'mutative';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { type CredentialAccount, GOTOSOCIAL, type UpdateCredentialsParams } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { DateTimePicker } from '@/components/ui/date-time-picker';
import { DialogOrSheet } from '@/components/ui/dialog-or-sheet';
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { iconHelper } from '@/components/ui/icon';
import { type IListSections, List } from '@/components/ui/list';
import { useClient, useFeatures, useInstance } from '@/contexts/current-account-context';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { Alert } from '@/stores/alerts';
import { useSetting } from '@/stores/settings';
import { getSegmentedMenuStyles } from '@/utils/themes';
import { toast } from '@/utils/toast';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ImagePickerAsset } from 'expo-image-picker';

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
  birthdayLabel: {
    id: 'edit_profile.fields.birthday.label',
    defaultMessage: 'Birthday',
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
  missingDescriptionHeading: {
    id: 'confirmations.edit_profile.missing_description.heading',
    defaultMessage: 'Missing description',
  },
  missingDescriptionMessage: {
    id: 'confirmations.edit_profile.missing_description.message',
    defaultMessage:
      'You have not entered a description for your avatar and header. Continue anyway?',
  },
  missingDescriptionAvatar: {
    id: 'confirmations.edit_profile.missing_description.avatar',
    defaultMessage: 'You have not entered a description for your avatar. Continue anyway?',
  },
  missingDescriptionHeader: {
    id: 'confirmations.edit_profile.missing_description.header',
    defaultMessage: 'You have not entered a description for your header. Continue anyway?',
  },
  missingDescriptionConfirm: {
    id: 'confirmations.edit_profile.missing_description.confirm',
    defaultMessage: 'Continue anyway',
  },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  backButtonConfirmationConfirm: {
    id: 'edit_profile.back_confirmation.confirm',
    defaultMessage: 'Discard',
  },
  metaFieldLabel: {
    id: 'edit_profile.fields.meta_fields.label.placeholder',
    defaultMessage: 'Label',
  },
  metaFieldContent: {
    id: 'edit_profile.fields.meta_fields.content.placeholder',
    defaultMessage: 'Content',
  },
  firstMetaFieldLabel: {
    id: 'edit_profile.fields.meta_fields.label.placeholder.first',
    defaultMessage: 'Label (e.g. pronouns)',
  },
  remove: { id: 'streamfield.remove', defaultMessage: 'Remove' },
  uploadHeader: { id: 'group.upload_banner.title', defaultMessage: 'Upload background picture' },
  clearHeader: { id: 'group.upload_banner.clear', defaultMessage: 'Clear header image' },
  uploadAvatar: { id: 'group.upload_avatar', defaultMessage: 'Upload avatar' },
  clearAvatar: { id: 'group.upload_avatar.clear', defaultMessage: 'Clear avatar image' },
  changeDescription: {
    id: 'group.upload_banner.change.description',
    defaultMessage: 'Change alt text',
  },
  save: { id: 'common.save', defaultMessage: 'Save' },
  placeholder: {
    id: 'alt_text_modal.placeholder',
    defaultMessage: 'Media description',
  },
  charactersRemaining: {
    id: 'textarea.counter.label',
    defaultMessage: '{count, plural, one {# character} other {# characters}} remaining',
  },
  uploadPermissionRequiredTitle: {
    id: 'upload_button.permission_required.title',
    defaultMessage: 'Permission required',
  },
  uploadPermissionRequiredMessage: {
    id: 'upload_button.permission_required.message',
    defaultMessage: 'Permission to access the media library is required.',
  },
});

interface IAltTextEditor {
  text: string;
  onSave: (value: string) => void;
  visible: boolean;
  onDismiss: () => void;
}

const AltTextEditor: React.FC<IAltTextEditor> = ({ text, onSave, visible, onDismiss }) => {
  const intl = useIntl();
  const {
    configuration: {
      media_attachments: { description_limit: descriptionLimit },
    },
  } = useInstance();

  const [closing, setClosing] = React.useState(false);
  const [description, setDescription] = React.useState(text);

  const handleClose = () => setClosing(true);

  const handleSave = () => {
    setClosing(true);
    onSave(description);
  };

  React.useEffect(() => {
    if (visible) setClosing(false);
  }, [visible]);

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={<FormattedMessage id='alt_text_modal.header' defaultMessage='Add alt text' />}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.save),
          onPress: handleSave,
          confirm: true,
        },
      ]}
      forceSheet
    >
      <View>
        <TextInput
          value={description}
          onChangeText={setDescription}
          variant='outlined'
          placeholder={intl.formatMessage(messages.placeholder)}
          multiline
          numberOfLines={4}
          maxLength={descriptionLimit}
          supportingText={intl.formatMessage(messages.charactersRemaining, {
            count: descriptionLimit - description.length,
          })}
          style={{ minHeight: 80 }}
        />
      </View>
    </DialogOrSheet>
  );
};

type UpdateCredentials = UpdateCredentialsParams & {
  fields: Array<{
    name: string;
    value: string;
  }>;
};

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
const accountToCredentials = (account: CredentialAccount): UpdateCredentials => {
  const hideNetwork = hidesNetwork(account);

  const fields = [...(account.__meta.source?.fields ?? [])];

  if (!fields.length) fields.push({});

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
    fields,
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
  const colorScheme = useColorScheme();
  const blackTheme = useSetting('appearance.black');
  const missingDescriptionModal = useSetting('compose.missingDescriptionModal');
  const client = useClient();
  const features = useFeatures();
  const instance = useInstance();

  const { mutateAsync: updateCredentials } = useUpdateCredentials();

  const [data, setData] = React.useState<UpdateCredentials>({
    fields: [],
  });
  const [isLoading, setLoading] = React.useState(true);
  const [muteStrangers, setMuteStrangers] = React.useState(false);
  const [hideNotificationContent, setHideNotificationContent] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [customCSSEditorExpanded, setCustomCSSEditorExpanded] = React.useState(false);
  const [avatar, setAvatar] = React.useState<ImagePickerAsset | string>();
  const [header, setHeader] = React.useState<ImagePickerAsset | string>();
  const [showAltTextEditor, setShowAltTextEditor] = React.useState<'avatar' | 'header'>();

  React.useEffect(() => {
    client.settings
      .verifyCredentials()
      .then((credentialAccount) => {
        const credentials = accountToCredentials(credentialAccount);
        const strangerNotifications =
          credentialAccount.__meta.pleroma?.notification_settings?.block_from_strangers === true;
        setData(credentials);
        setAvatar(
          credentialAccount.avatar_default ? undefined : credentialAccount.avatar || undefined,
        );
        setHeader(
          credentialAccount.header_default ? undefined : credentialAccount.header || undefined,
        );
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

      const { fields, ...rest } = data;
      const params: UpdateCredentialsParams = {
        ...rest,
      };

      if (fields.length === 0) params.fields_attributes = {};
      else {
        const padLength = fields.length.toString().length;
        params.fields_attributes = Object.fromEntries(
          fields.map(({ name, value }, i) => [
            i.toString().padStart(padLength, '0'),
            { name, value },
          ]),
        );
      }
      if (typeof header === 'object') {
        params.header = new File(header.uri) as any as globalThis.File;
      } else if (!header) {
        params.header = '';
      }
      if (typeof avatar === 'object') {
        params.avatar = new File(avatar.uri) as any as globalThis.File;
      } else if (!avatar) {
        params.avatar = '';
      }

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

    const missingAvatarDescription =
      features.accountAvatarDescription && avatar && !data.avatar_description;
    const missingHeaderDescription =
      features.accountAvatarDescription && header && !data.header_description;

    if (missingDescriptionModal && (missingAvatarDescription || missingHeaderDescription)) {
      return Alert.alert(
        intl.formatMessage(messages.missingDescriptionHeading),
        intl.formatMessage(
          missingAvatarDescription && missingHeaderDescription
            ? messages.missingDescriptionMessage
            : missingAvatarDescription
              ? messages.missingDescriptionAvatar
              : messages.missingDescriptionHeader,
        ),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.missingDescriptionConfirm),
            onPress: onConfirm,
          },
        ],
      );
    }

    onConfirm();
  };

  /** Set a single key in the request data. */
  const updateData = (key: string, value: any | ((oldValue: any) => any)) => {
    setIsChanged(true);
    setData((prevData) => ({
      ...prevData,
      [key]: typeof value === 'function' ? create(prevData[key], value) : value,
    }));
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

  const handleBirthdayChange = (date: Date) => {
    updateData(
      'birthday',
      new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    );
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

  const handleAddField = () => {
    const oldFields = data.fields ?? [];
    const fields = [...oldFields, { name: '', value: '' }];
    updateData('fields', fields);
  };

  const handleRemoveField = (i: number) => {
    const oldFields = data.fields ?? [];
    const fields = [...oldFields];
    fields.splice(i, 1);
    updateData('fields', fields);
  };

  const handleAddAvatar = async (type: 'avatar' | 'header') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        intl.formatMessage(messages.uploadPermissionRequiredTitle),
        intl.formatMessage(messages.uploadPermissionRequiredMessage),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      selectionLimit: 1,
    });

    if (result.canceled) return;

    setIsChanged(true);

    if (type === 'avatar') {
      setAvatar(result.assets[0]);
    } else {
      setHeader(result.assets[0]);
    }
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

  const listSections = React.useMemo(() => {
    const profileSection: IListSections[number] = {
      items: [],
    };

    if (features.followRequests) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.lockedLabel),
        sublabel: intl.formatMessage(messages.lockedHint),
        active: !!data.locked,
        onPress: handleToggle('locked'),
      });
    }

    if (features.hideNetwork) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.hideNetworkLabel),
        sublabel: intl.formatMessage(messages.hideNetworkHint),
        active: hideNetwork,
        onPress: handleHideNetworkChange,
      });
    }

    if (features.bots) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.botLabel),
        sublabel: intl.formatMessage(messages.botHint),
        active: !!data.bot,
        onPress: handleToggle('bot'),
      });
    }

    if (features.accountDiscoverability) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.discoverableLabel),
        sublabel: intl.formatMessage(messages.discoverableHint),
        active: !!data.discoverable,
        onPress: handleToggle('discoverable'),
      });
    }

    if (features.rssFeeds && features.version.software === GOTOSOCIAL) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.rssLabel),
        active: !!data.enable_rss,
        onPress: handleToggle('enable_rss'),
      });
    }

    if (features.accountIsCat) {
      profileSection.items.push(
        {
          type: 'toggle',
          label: intl.formatMessage(messages.isCatLabel),
          sublabel: intl.formatMessage(messages.isCatHint),
          active: !!data.is_cat,
          onPress: handleToggle('is_cat'),
        },
        {
          type: 'toggle',
          label: intl.formatMessage(messages.speakAsCatLabel),
          sublabel: intl.formatMessage(messages.speakAsCatHint),
          active: !!data.speak_as_cat,
          onPress: handleToggle('speak_as_cat'),
        },
      );
    }

    if (features.biteControls) {
      profileSection.items.push({
        type: 'select',
        label: intl.formatMessage(messages.biteControlsLabel),
        active: data.bite_controls ?? 'none',
        onChange: handleFieldChange('bite_controls'),
        options: [
          { value: 'public', label: intl.formatMessage(messages.biteControlsPublic) },
          { value: 'followers', label: intl.formatMessage(messages.biteControlsFollowers) },
          { value: 'none', label: intl.formatMessage(messages.biteControlsNone) },
        ],
      });
    }

    if (features.accountWebLayout) {
      profileSection.items.push({
        type: 'select',
        label: intl.formatMessage(messages.webLayoutLabel),
        active: data.web_layout,
        onChange: handleFieldChange('web_layout'),
        options: [
          { value: 'microblog', label: intl.formatMessage(messages.webLayoutMicroblog) },
          { value: 'gallery', label: intl.formatMessage(messages.webLayoutGallery) },
        ],
      });
    }

    if (features.accountWebVisibility) {
      profileSection.items.push({
        type: 'select',
        label: intl.formatMessage(messages.webVisibilityLabel),
        active: data.web_visibility,
        onChange: handleFieldChange('web_visibility'),
        options: [
          { value: 'public', label: intl.formatMessage(messages.webVisibilityPublic) },
          { value: 'unlisted', label: intl.formatMessage(messages.webVisibilityUnlisted) },
          { value: 'none', label: intl.formatMessage(messages.webVisibilityNone) },
        ],
      });
    }

    if (features.accountWebIncludeBoosts) {
      profileSection.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.webIncludeBoostsLabel),
        sublabel: intl.formatMessage(messages.webIncludeBoostsHint),
        active: !!data.web_include_boosts,
        onPress: handleToggle('web_include_boosts'),
      });
    }

    if (features.accountMentionPolicy) {
      profileSection.items.push({
        type: 'select',
        label: intl.formatMessage(messages.mentionPolicyLabel),
        sublabel: intl.formatMessage(messages.mentionPolicyHint),
        active: data.mention_policy,
        onChange: handleFieldChange('mention_policy'),
        options: [
          { value: 'none', label: intl.formatMessage(messages.mentionPolicyNone) },
          { value: 'only_known', label: intl.formatMessage(messages.mentionPolicyOnlyKnown) },
          {
            value: 'only_contacts',
            label: intl.formatMessage(messages.mentionPolicyOnlyContacts),
          },
        ],
      });
    }

    const sections: IListSections = [profileSection];

    if (features.muteStrangers) {
      sections.push({
        items: [
          {
            type: 'toggle',
            label: intl.formatMessage(messages.strangerNotificationsLabel),
            sublabel: intl.formatMessage(messages.strangerNotificationsHint),
            active: muteStrangers,
            onPress: () => setMuteStrangers(!muteStrangers),
          },
          {
            type: 'toggle',
            label: intl.formatMessage(messages.hideNotificationContentLabel),
            active: hideNotificationContent,
            onPress: () => setHideNotificationContent(!hideNotificationContent),
          },
        ],
      });
    }

    return sections;
  }, [features, data, hideNetwork, muteStrangers, hideNotificationContent]);

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

  const headerMenu = React.useMemo(() => {
    const items: Array<DropdownMenuItem> = [];

    items.push({
      key: 'upload',
      type: 'button',
      label: intl.formatMessage(messages.uploadHeader),
      onPress: () => handleAddAvatar('header'),
      appleIcon: 'photo.on.rectangle.angled',
      androidIcon: 'ph_images',
    });

    if (header && features.accountAvatarDescription) {
      items.push({
        key: 'change-description',
        type: 'button',
        label: intl.formatMessage(messages.changeDescription),
        onPress: () => setShowAltTextEditor('header'),
        appleIcon: 'text.document',
        androidIcon: 'ph_file_text',
      });
    }

    if (header) {
      items.push({
        key: 'remove',
        type: 'button',
        label: intl.formatMessage(messages.clearHeader),
        onPress: () => setHeader(undefined),
        appleIcon: 'xmark',
        androidIcon: 'ph_x',
        destructive: true,
      });
    }

    return items;
  }, [features, header, data.header_description]);

  const avatarMenu = React.useMemo(() => {
    const items: Array<DropdownMenuItem> = [];

    items.push({
      key: 'upload',
      type: 'button',
      label: intl.formatMessage(messages.uploadAvatar),
      onPress: () => handleAddAvatar('avatar'),
      appleIcon: 'photo.on.rectangle.angled',
      androidIcon: 'ph_images',
    });

    if (avatar && features.accountAvatarDescription) {
      items.push({
        key: 'change-description',
        type: 'button',
        label: intl.formatMessage(messages.changeDescription),
        onPress: () => setShowAltTextEditor('avatar'),
        appleIcon: 'text.document',
        androidIcon: 'ph_file_text',
      });
    }

    if (avatar) {
      items.push({
        key: 'remove',
        type: 'button',
        label: intl.formatMessage(messages.clearAvatar),
        onPress: () => setAvatar(undefined),
        appleIcon: 'xmark',
        androidIcon: 'ph_x',
        destructive: true,
      });
    }

    return items;
  }, [features, avatar, data.avatar_description]);

  return (
    <>
      <Appbar.Header
        mode='small'
        style={[
          {
            backgroundColor: theme.colors.surfaceContainer,
          },
          colorScheme === 'dark' &&
            blackTheme && {
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.surfaceContainerHighest,
            },
        ]}
      >
        <HeaderBackButton onPress={handleBackButton} />
        <Appbar.Content title={intl.formatMessage(messages.heading)} />
        <HeaderIconButton icon={CheckIcon} disabled={isLoading} onPress={handleSubmit} />
      </Appbar.Header>
      <ScrollView>
        <View style={{ padding: 16, paddingBottom: 0, gap: 12 }}>
          <View style={{ position: 'relative', marginBottom: -16 }}>
            <DropdownMenu
              fullWidth
              trigger={
                <View
                  style={{
                    borderRadius: theme.shapes.corner.medium,
                    borderWidth: 1,
                    borderColor: theme.colors.surfaceDim,
                    width: '100%',
                    aspectRatio: 3,
                    overflow: 'hidden',
                    backgroundColor: theme.colors.surfaceContainerHigh,
                  }}
                >
                  <Image
                    source={typeof header === 'string' ? { uri: header } : header}
                    style={{
                      position: 'absolute',
                      inset: 0,
                    }}
                    recyclingKey={typeof header === 'string' ? header : header?.uri}
                  />
                </View>
              }
              items={headerMenu}
            />
            <View
              style={{
                left: 16,
                bottom: 16,
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 3,
                borderColor: theme.colors.background,
                overflow: 'hidden',
              }}
            >
              <DropdownMenu
                trigger={
                  <Pressable
                    style={{
                      borderRadius: 40,
                      borderWidth: 1,
                      borderColor: theme.colors.surfaceDim,
                      height: 82,
                      width: 82,
                      maxWidth: 82,
                      aspectRatio: 3,
                      overflow: 'hidden',
                      backgroundColor: theme.colors.surfaceContainerHigh,
                      zIndex: 10,
                    }}
                  >
                    <Image
                      source={typeof avatar === 'string' ? { uri: avatar } : avatar}
                      style={{
                        position: 'absolute',
                        inset: 0,
                      }}
                      recyclingKey={typeof avatar === 'string' ? avatar : avatar?.uri}
                    />
                  </Pressable>
                }
                items={avatarMenu}
              />
            </View>
          </View>

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

          {features.birthdays && (
            <DateTimePicker
              title={intl.formatMessage(messages.birthdayLabel)}
              initialDate={data.birthday ? new Date(data.birthday) : undefined}
              onSelect={handleBirthdayChange}
              listItemStyle={getSegmentedMenuStyles(theme, false, 0, 1)}
              withTime={false}
            />
          )}

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

        <PaperList.Section>
          <PaperList.Subheader>
            <FormattedMessage
              id='edit_profile.fields.meta_fields.label'
              defaultMessage='Profile fields'
            />
          </PaperList.Subheader>
          <View style={{ gap: 2 }}>
            {data.fields.map((field, index, fields) => {
              const styles = [
                getSegmentedMenuStyles(theme, false, index, fields.length),
                { marginHorizontal: 16 },
              ];

              return (
                <PaperList.Item
                  key={index}
                  style={styles}
                  title={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ flex: 2 }}>
                        <TextInput
                          variant='outlined'
                          label={intl.formatMessage(messages.metaFieldLabel)}
                          placeholder={intl.formatMessage(
                            index === 0 ? messages.firstMetaFieldLabel : messages.metaFieldLabel,
                          )}
                          value={field.name}
                          onChangeText={(text) =>
                            updateData('fields', (fields) => {
                              fields[index].name = text;
                            })
                          }
                        />
                      </View>
                      <View style={{ flex: 3 }}>
                        <TextInput
                          variant='outlined'
                          label={intl.formatMessage(messages.metaFieldContent)}
                          placeholder={intl.formatMessage(messages.metaFieldContent)}
                          value={field.value}
                          onChangeText={(text) =>
                            updateData('fields', (fields) => {
                              fields[index].value = text;
                            })
                          }
                        />
                      </View>
                      {data.fields.length > 1 && (
                        <IconButton
                          onPress={() => handleRemoveField(index)}
                          icon={iconHelper(XIcon)}
                          style={{ margin: -4 }}
                          accessibilityLabel={intl.formatMessage(messages.remove)}
                        />
                      )}
                    </View>
                  )}
                />
              );
            })}
          </View>
          {data.fields.length <=
            (instance.configuration.accounts?.max_profile_fields ??
              instance.pleroma.metadata.fields_limits.max_fields) && (
            <Button
              mode='text'
              icon={iconHelper(PlusIcon)}
              onPress={handleAddField}
              style={{ alignSelf: 'flex-start', marginHorizontal: 8 }}
            >
              <FormattedMessage
                id='edit_profile.fields.meta_fields.add_field'
                defaultMessage='Add field'
              />
            </Button>
          )}
        </PaperList.Section>

        <List sections={listSections} />

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
      {showAltTextEditor && (
        <AltTextEditor
          text={
            (showAltTextEditor === 'avatar' ? data.avatar_description : data.header_description) ||
            ''
          }
          onSave={(text) => {
            updateData(
              showAltTextEditor === 'avatar' ? 'avatar_description' : 'header_description',
              text,
            );
          }}
          visible
          onDismiss={() => setShowAltTextEditor(undefined)}
        />
      )}
    </>
  );
};

export { EditProfileScreen };
