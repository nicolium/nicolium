import { Appbar, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { pick } from 'lodash-es';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';
import { toast } from 'sonner-native';

import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CredentialAccount, UpdateCredentialsParams } from 'pl-api';

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
  success: {
    id: 'edit_profile.success',
    defaultMessage: 'Profile saved',
  },
  error: { id: 'edit_profile.error', defaultMessage: 'Failed to update profile' },
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
  const { colors } = useTheme();
  const client = useClient();
  const features = useFeatures();

  const { mutate: updateCredentials } = useUpdateCredentials();

  const [data, setData] = React.useState<UpdateCredentialsParams>({});
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    client.settings
      .verifyCredentials()
      .then((credentialAccount) => {
        const credentials = accountToCredentials(credentialAccount);
        const strangerNotifications =
          credentialAccount.__meta.pleroma?.notification_settings?.block_from_strangers === true;
        setData(credentials);
        // setMuteStrangers(strangerNotifications);
        // setHideNotificationContent(
        //   credentialAccount.__meta.pleroma?.hide_notification_content ?? false,
        // );
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

      // if (!instance.configuration.accounts?.allow_custom_css) delete params.custom_css;

      promises.push(updateCredentials(params as any));

      // if (features.muteStrangers) {
      //   promises.push(
      //     client.settings
      //       .updateNotificationSettings({
      //         block_from_strangers: muteStrangers,
      //         hide_notification_contents: hideNotificationContent,
      //       })
      //       .catch(console.error),
      //   );
      // }

      setLoading(true);

      Promise.all(promises)
        .then(() => {
          setLoading(false);
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
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleFieldChange =
    <T = any,>(key: keyof UpdateCredentialsParams) =>
    (value: T) => {
      updateData(key, value);
    };

  const handleCheckboxChange =
    (key: keyof UpdateCredentialsParams): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      updateData(key, e.target.checked);
    };

  const handleTextChange = (key: keyof UpdateCredentialsParams) => (value: string) => {
    updateData(key, value);
  };

  const handleBirthdayChange = (date: string) => {
    updateData('birthday', date);
  };

  return (
    <>
      <Appbar.Header
        mode='small'
        style={{
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <HeaderBackButton onPress={navigation.goBack} />
        <Appbar.Content title={intl.formatMessage(messages.heading)} />
        <HeaderIconButton icon={CheckIcon} disabled={isLoading} onPress={handleSubmit} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
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
          style={{ minHeight: 160 }}
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
      </ScrollView>
    </>
  );
};

export { EditProfileScreen };
