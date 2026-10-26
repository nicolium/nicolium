import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { List } from '@/components/ui/list';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
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
  stripMetadata: {
    id: 'url_privacy.strip_metadata',
    defaultMessage: 'Strip metadata from uploaded images',
  },
  stripMetadataHint: {
    id: 'url_privacy.strip_metadata.hint',
    defaultMessage:
      'Removes metadata such as EXIF tags, including geolocation, from images before hitting the server. This is usually done server-side, regardless of client settings.',
  },
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
  const stripMetadata = useSetting('compose.stripMetadata');

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
              {
                type: 'toggle',
                label: intl.formatMessage(messages.stripMetadata),
                sublabel: intl.formatMessage(messages.stripMetadataHint),
                active: stripMetadata,
                onPress: () => update('compose.stripMetadata', !stripMetadata),
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { ComposeSettingsScreen };
