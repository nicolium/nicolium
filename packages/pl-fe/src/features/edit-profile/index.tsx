import pick from 'lodash/pick';
import { type CredentialAccount, GOTOSOCIAL } from 'pl-api';
import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { updateNotificationSettings } from 'pl-fe/actions/accounts';
import { patchMe } from 'pl-fe/actions/me';
import BirthdayInput from 'pl-fe/components/birthday-input';
import List, { ListItem } from 'pl-fe/components/list';
import Accordion from 'pl-fe/components/ui/accordion';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import Streamfield from 'pl-fe/components/ui/streamfield';
import Textarea from 'pl-fe/components/ui/textarea';
import Toggle from 'pl-fe/components/ui/toggle';
import { useImageField } from 'pl-fe/hooks/forms/use-image-field';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';
import { isDefaultAvatar, isDefaultHeader } from 'pl-fe/utils/accounts';

import { SelectDropdown } from '../forms';

import AvatarPicker from './components/avatar-picker';
import HeaderPicker from './components/header-picker';

import type { StreamfieldComponent } from 'pl-fe/components/ui/streamfield';

const nonDefaultAvatar = (url: string | undefined) => url && isDefaultAvatar(url) ? undefined : url;
const nonDefaultHeader = (url: string | undefined) => url && isDefaultHeader(url) ? undefined : url;

/**
 * Whether the user is hiding their follows and/or followers.
 * Pleroma's config is granular, but we simplify it into one setting.
 */
const hidesNetwork = ({ __meta }: Pick<CredentialAccount, '__meta'>): boolean => Boolean(
  __meta.pleroma?.hide_followers && __meta.pleroma?.hide_follows && __meta.pleroma?.hide_followers_count && __meta.pleroma?.hide_follows_count,
);

const messages = defineMessages({
  heading: { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  header: { id: 'edit_profile.header', defaultMessage: 'Edit profile' },
  metaFieldLabel: { id: 'edit_profile.fields.meta_fields.label_placeholder', defaultMessage: 'Label' },
  metaFieldContent: { id: 'edit_profile.fields.meta_fields.content_placeholder', defaultMessage: 'Content' },
  firstMetaFieldLabel: { id: 'edit_profile.fields.meta_fields.label_placeholder.first', defaultMessage: 'Label (e.g. pronouns)' },
  success: { id: 'edit_profile.success', defaultMessage: 'Your profile has been successfully saved!' },
  error: { id: 'edit_profile.error', defaultMessage: 'Profile update failed' },
  bioPlaceholder: { id: 'edit_profile.fields.bio_placeholder', defaultMessage: 'Tell us about yourself.' },
  displayNamePlaceholder: { id: 'edit_profile.fields.display_name_placeholder', defaultMessage: 'Name' },
  locationPlaceholder: { id: 'edit_profile.fields.location_placeholder', defaultMessage: 'Location' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  mentionPolicyNone: { id: 'edit_profile.fields.mention_policy.none', defaultMessage: 'Everybody' },
  mentionPolicyOnlyKnown: { id: 'edit_profile.fields.mention_policy.only_known', defaultMessage: 'Everybody except new accounts' },
  mentionPolicyOnlyContacts: { id: 'edit_profile.fields.mention_policy.only_contacts', defaultMessage: 'People I follow and my followers' },
  webLayoutMicroblog: { id: 'edit_profile.fields.web_layout.microblog', defaultMessage: 'Classic microblog layout' },
  webLayoutGallery: { id: 'edit_profile.fields.web_layout.gallery', defaultMessage: 'Media-only gallery layout' },
  webVisibilityPublic: { id: 'edit_profile.fields.web_visibility.public', defaultMessage: 'Show public posts only' },
  webVisibilityUnlisted: { id: 'edit_profile.fields.web_visibility.unlisted', defaultMessage: 'Show public and unlisted posts' },
  webVisibilityNone: { id: 'edit_profile.fields.web_visibility.none', defaultMessage: 'Show no posts' },
  customCSSLabel: { id: 'edit_profile.fields.custom_css_label', defaultMessage: 'Custom CSS' },
});

/**
 * Profile metadata `name` and `value`.
 * (By default, max 4 fields and 255 characters per property/value)
 */
interface AccountCredentialsField {
  name: string;
  value: string;
}

/** Private information (settings) for the account. */
interface AccountCredentialsSource {
  /** Default post privacy for authored statuses. */
  privacy?: string;
  /** Whether to mark authored statuses as sensitive by default. */
  sensitive?: boolean;
  /** Default language to use for authored statuses. (ISO 6391) */
  language?: string;
}

/**
 * Params to submit when updating an account.
 * @see PATCH /api/v1/accounts/update_credentials
 */
interface AccountCredentials {
  /** Whether the account should be shown in the profile directory. */
  discoverable?: boolean;
  /** Whether the account has a bot flag. */
  bot?: boolean;
  /** The display name to use for the profile. */
  display_name?: string;
  /** The account bio. */
  note?: string;
  /** Avatar image encoded using multipart/form-data */
  avatar?: File | '';
  /** Header image encoded using multipart/form-data */
  header?: File | '';
  /** Whether manual approval of follow requests is required. */
  locked?: boolean;
  /** Private information (settings) about the account. */
  source?: AccountCredentialsSource;
  /** Custom profile fields. */
  fields_attributes?: AccountCredentialsField[];

  // Non-Mastodon fields
  /** Pleroma: whether to accept notifications from people you don't follow. */
  stranger_notifications?: boolean;
  /** Pleroma: whether to publicly display followers. */
  hide_followers?: boolean;
  /** Pleroma: whether to publicly display follows. */
  hide_follows?: boolean;
  /** Pleroma: whether to publicly display follower count. */
  hide_followers_count?: boolean;
  /** Pleroma: whether to publicly display follows count. */
  hide_follows_count?: boolean;
  /** User's location. */
  location?: string;
  /** User's birthday. */
  birthday?: string;
  /** GoToSocial: Avatar image description. */
  avatar_description?: string;
  /** GoToSocial: Header image description. */
  header_description?: string;
  /** GoToSocial: Enable RSS feed for public posts */
  enable_rss?: boolean;
  /** GoToSocial: whether to publicly display followers/follows. */
  hide_collections?: boolean;
  /** Whether the user is a cat. */
  is_cat?: boolean;
  /** Whether the user speaks as a cat. */
  speak_as_cat?: boolean;
  /** Mention policy */
  mention_policy?: string;
  web_layout?: string;
  web_visibility?: string;
  custom_css?: string;
}

/** Convert an account into an update_credentials request object. */
const accountToCredentials = (account: CredentialAccount): AccountCredentials => {
  const hideNetwork = hidesNetwork(account);

  return {
    ...(pick(account, ['birthday', 'bot', 'custom_css', 'display_name', 'locked', 'location', 'avatar_description', 'header_description', 'enable_rss', 'hide_collections', 'is_cat', 'speak_as_cat', 'mention_policy'])),
    ...(pick(account.source, ['discoverable', 'note', 'web_layout', 'web_visibility'])),
    fields_attributes: [...account.__meta.source?.fields ?? []],
    stranger_notifications: account.__meta.pleroma?.notification_settings?.block_from_strangers === true,
    hide_followers: hideNetwork,
    hide_follows: hideNetwork,
    hide_followers_count: hideNetwork,
    hide_follows_count: hideNetwork,
  };
};

const ProfileField: StreamfieldComponent<AccountCredentialsField> = ({ index, value, onChange }) => {
  const intl = useIntl();

  const handleChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => e => {
    onChange({ ...value, [key]: e.currentTarget.value });
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-2/5 grow'
        value={value.name}
        onChange={handleChange('name')}
        placeholder={index === 0 ? intl.formatMessage(messages.firstMetaFieldLabel) : intl.formatMessage(messages.metaFieldLabel)}
      />
      <Input
        type='text'
        outerClassName='w-3/5 grow'
        value={value.value}
        onChange={handleChange('value')}
        placeholder={intl.formatMessage(messages.metaFieldContent)}
      />
    </HStack>
  );
};

/** Edit profile page. */
const EditProfile: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const client = useClient();

  const { account } = useOwnAccount();
  const features = useFeatures();
  const maxFields = instance.configuration.accounts
    ? instance.configuration.accounts.max_profile_fields
    : instance.pleroma.metadata.fields_limits.max_fields;

  const attachmentTypes = useAppSelector(
    state => state.instance.configuration.media_attachments.supported_mime_types)
    ?.filter(type => type.startsWith('image/'))
    .join(',');

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<AccountCredentials>({});
  const [muteStrangers, setMuteStrangers] = useState(false);
  const [customCSSEditorExpanded, setCustomCSSEditorExpanded] = useState(false);

  const avatar = useImageField({ maxPixels: 400 * 400, preview: nonDefaultAvatar(account?.avatar) });
  const header = useImageField({ maxPixels: 1920 * 1080, preview: nonDefaultHeader(account?.header) });

  useEffect(() => {
    client.settings.verifyCredentials().then((credentialAccount) => {
      const credentials = accountToCredentials(credentialAccount);
      const strangerNotifications = credentialAccount.__meta.pleroma?.notification_settings?.block_from_strangers === true;
      setData(credentials);
      setMuteStrangers(strangerNotifications);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [account?.id]);

  /** Set a single key in the request data. */
  const updateData = (key: string, value: any) => {
    setData(prevData => ({ ...prevData, [key]: value }));
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    const promises = [];

    const params = { ...data };
    if (params.fields_attributes?.length === 0) params.fields_attributes = [{ name: '', value: '' }];
    if (header.file !== undefined) params.header = header.file || '';
    if (avatar.file !== undefined) params.avatar = avatar.file || '';

    if (!instance.configuration.accounts?.allow_custom_css) delete params.custom_css;

    promises.push(dispatch(patchMe(params as any)));

    if (features.muteStrangers) {
      promises.push(
        dispatch(updateNotificationSettings({
          block_from_strangers: muteStrangers,
        })).catch(console.error),
      );
    }

    setLoading(true);

    Promise.all(promises).then(() => {
      setLoading(false);
      toast.success(intl.formatMessage(messages.success));
    }).catch(() => {
      setLoading(false);
      toast.error(intl.formatMessage(messages.error));
    });

    event.preventDefault();
  };

  const handleFieldChange = <T = any>(key: keyof AccountCredentials) => (value: T) => {
    updateData(key, value);
  };

  const handleCheckboxChange = (key: keyof AccountCredentials): React.ChangeEventHandler<HTMLInputElement> => e => {
    updateData(key, e.target.checked);
  };

  const handleTextChange = (key: keyof AccountCredentials): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => e => {
    updateData(key, e.target.value);
  };

  const handleBirthdayChange = (date: string) => {
    updateData('birthday', date);
  };

  const handleHideNetworkChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const hide = e.target.checked;
    setData(prevData => ({
      ...prevData,
      ...(features.version.software === GOTOSOCIAL ? { hide_collections: hide } : {
        hide_followers: hide,
        hide_follows: hide,
        hide_followers_count: hide,
        hide_follows_count: hide,
      }),
    }));
  };

  const handleFieldsChange = (fields: AccountCredentialsField[]) => {
    updateData('fields_attributes', fields);
  };

  const handleAddField = () => {
    const oldFields = data.fields_attributes || [];
    const fields = [...oldFields, { name: '', value: '' }];
    updateData('fields_attributes', fields);
  };

  const handleRemoveField = (i: number) => {
    const oldFields = data.fields_attributes || [];
    const fields = [...oldFields];
    fields.splice(i, 1);
    updateData('fields_attributes', fields);
  };

  const handleAvatarChangeDescription = features.accountAvatarDescription
    ? handleFieldChange<string>('avatar_description') : undefined;
  const handleHeaderChangeDescription = features.accountAvatarDescription
    ? handleFieldChange<string>('header_description') : undefined;

  return (
    <Column label={intl.formatMessage(messages.header)}>
      <Form onSubmit={handleSubmit}>
        <div className='relative mb-12 flex'>
          <HeaderPicker
            accept={attachmentTypes}
            disabled={isLoading}
            description={data.header_description}
            onChangeDescription={handleHeaderChangeDescription}
            {...header}
          />
          <AvatarPicker
            className='!sm:left-6 !left-4 !translate-x-0'
            accept={attachmentTypes}
            disabled={isLoading}
            description={data.avatar_description}
            onChangeDescription={handleAvatarChangeDescription}
            {...avatar}
          />
        </div>

        <FormGroup
          labelText={<FormattedMessage id='edit_profile.fields.display_name_label' defaultMessage='Display name' />}
        >
          <Input
            type='text'
            value={data.display_name}
            onChange={handleTextChange('display_name')}
            placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
          />
        </FormGroup>

        {features.birthdays && (
          <FormGroup
            labelText={<FormattedMessage id='edit_profile.fields.birthday_label' defaultMessage='Birthday' />}
          >
            <BirthdayInput
              value={data.birthday}
              onChange={handleBirthdayChange}
            />
          </FormGroup>
        )}

        {features.accountLocation && (
          <FormGroup
            labelText={<FormattedMessage id='edit_profile.fields.location_label' defaultMessage='Location' />}
          >
            <Input
              type='text'
              value={data.location}
              onChange={handleTextChange('location')}
              placeholder={intl.formatMessage(messages.locationPlaceholder)}
            />
          </FormGroup>
        )}

        <FormGroup
          labelText={<FormattedMessage id='edit_profile.fields.bio_label' defaultMessage='Bio' />}
        >
          <Textarea
            value={data.note}
            onChange={handleTextChange('note')}
            autoComplete='off'
            placeholder={intl.formatMessage(messages.bioPlaceholder)}
          />
        </FormGroup>

        <List>
          {features.followRequests && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.locked_label' defaultMessage='Lock account' />}
              hint={<FormattedMessage id='edit_profile.hints.locked' defaultMessage='Requires you to manually approve followers' />}
            >
              <Toggle
                checked={data.locked}
                onChange={handleCheckboxChange('locked')}
              />
            </ListItem>
          )}

          {features.hideNetwork && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.hide_network_label' defaultMessage='Hide network' />}
              hint={<FormattedMessage id='edit_profile.hints.hide_network' defaultMessage='Who you follow and who follows you will not be shown on your profile' />}
            >
              <Toggle
                checked={account ? (features.version.software === GOTOSOCIAL ? data.hide_collections : (data.hide_followers && data.hide_follows && data.hide_followers_count && data.hide_follows_count)) : false}
                onChange={handleHideNetworkChange}
              />
            </ListItem>
          )}

          {features.bots && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.bot_label' defaultMessage='This is a bot account' />}
              hint={<FormattedMessage id='edit_profile.hints.bot' defaultMessage='This account mainly performs automated actions and might not be monitored' />}
            >
              <Toggle
                checked={data.bot}
                onChange={handleCheckboxChange('bot')}
              />
            </ListItem>
          )}

          {features.muteStrangers && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.stranger_notifications_label' defaultMessage='Block notifications from strangers' />}
              hint={<FormattedMessage id='edit_profile.hints.stranger_notifications' defaultMessage='Only show notifications from people you follow' />}
            >
              <Toggle
                checked={muteStrangers}
                onChange={(e) => setMuteStrangers(e.target.checked)}
              />
            </ListItem>
          )}

          {features.accountDiscoverability && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.discoverable_label' defaultMessage='Allow account discovery' />}
              hint={<FormattedMessage id='edit_profile.hints.discoverable' defaultMessage='Display account in profile directory and allow indexing by external services' />}
            >
              <Toggle
                checked={data.discoverable}
                onChange={handleCheckboxChange('discoverable')}
              />
            </ListItem>
          )}

          {features.rssFeeds && features.version.software === GOTOSOCIAL && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.rss_label' defaultMessage='Enable RSS feed for public posts' />}
            >
              <Toggle
                checked={data.enable_rss}
                onChange={handleCheckboxChange('enable_rss')}
              />
            </ListItem>
          )}

          {features.accountIsCat && (
            <>
              <ListItem
                label={<FormattedMessage id='edit_profile.fields.is_cat_label' defaultMessage='The user is a cat' />}
                hint={<FormattedMessage id='edit_profile.hints.is_cat' defaultMessage='Mark this account as a cat.' />}
              >
                <Toggle
                  checked={data.is_cat}
                  onChange={handleCheckboxChange('is_cat')}
                />
              </ListItem>

              <ListItem
                label={<FormattedMessage id='edit_profile.fields.speak_as_cat_label' defaultMessage='The user speaks as a cat' />}
                hint={<FormattedMessage id='edit_profile.hints.speak_as_cat' defaultMessage='Your posts will get nyanified.' />}
              >
                <Toggle
                  checked={data.speak_as_cat}
                  onChange={handleCheckboxChange('speak_as_cat')}
                />
              </ListItem>
            </>
          )}

          {features.accountWebLayout && (
            <ListItem
              label={<FormattedMessage id='preferences.fields.web_layout_label' defaultMessage='Layout of the web view of your profile' />}
            >
              <SelectDropdown
                className='max-w-fit'
                items={{
                  microblog: intl.formatMessage(messages.webLayoutMicroblog),
                  gallery: intl.formatMessage(messages.webLayoutGallery),
                }}
                defaultValue={data.web_layout}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('web_layout')(event.target.value)}
              />
            </ListItem>
          )}

          {features.accountWebVisibility && (
            <ListItem
              label={<FormattedMessage id='preferences.fields.web_visibility_label' defaultMessage='Visibility level of posts displayed on your profile' />}
            >
              <SelectDropdown
                className='max-w-fit'
                items={{
                  public: intl.formatMessage(messages.webVisibilityPublic),
                  unlisted: intl.formatMessage(messages.webVisibilityUnlisted),
                  none: intl.formatMessage(messages.webVisibilityNone),
                }}
                defaultValue={data.web_visibility}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('web_visibility')(event.target.value)}
              />
            </ListItem>
          )}

          {features.accountMentionPolicy && (
            <ListItem
              label={<FormattedMessage id='preferences.fields.mention_policy_label' defaultMessage='Accept mentions from' />}
              hint={<FormattedMessage id='preferences.hints.mention_policy' defaultMessage='Applies to direct messages and public posts' />}
            >
              <SelectDropdown
                key={data.mention_policy ? 'true' : 'false'}
                className='max-w-fit'
                items={{
                  none: intl.formatMessage(messages.mentionPolicyNone),
                  only_known: intl.formatMessage(messages.mentionPolicyOnlyKnown),
                  only_contacts: intl.formatMessage(messages.mentionPolicyOnlyContacts),
                }}
                defaultValue={data.mention_policy}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('mention_policy')(event.target.value)}
              />
            </ListItem>
          )}
        </List>

        {features.profileFields && (
          <Streamfield
            label={<FormattedMessage id='edit_profile.fields.meta_fields_label' defaultMessage='Profile fields' />}
            hint={<FormattedMessage id='edit_profile.hints.meta_fields' defaultMessage='You can have up to {count, plural, one {# custom field} other {# custom fields}} displayed on your profile.' values={{ count: maxFields }} />}
            values={data.fields_attributes || []}
            onChange={handleFieldsChange}
            onAddItem={handleAddField}
            onRemoveItem={handleRemoveField}
            component={ProfileField}
            maxItems={maxFields}
            draggable
          />
        )}

        {instance.configuration.accounts?.allow_custom_css && (
          <Accordion
            headline={intl.formatMessage(messages.customCSSLabel)}
            expanded={customCSSEditorExpanded}
            onToggle={setCustomCSSEditorExpanded}
          >
            <FormGroup>
              <Textarea
                value={data.custom_css}
                onChange={handleTextChange('custom_css')}
                isCodeEditor
                rows={12}
              />
              <p className='mt-0.5 text-right text-xs text-gray-700 dark:text-gray-600'>
                <FormattedMessage
                  id='edit_profile.custom_css.remaining_characters'
                  defaultMessage='{remaining, plural, one {# character} other {# characters}} remaining'
                  values={{ remaining: 5000 - (data.custom_css || '').length }}
                />
              </p>
            </FormGroup>
          </Accordion>
        )}

        <FormActions>
          <Button to='/settings' theme='tertiary'>
            {intl.formatMessage(messages.cancel)}
          </Button>

          <Button theme='primary' type='submit' disabled={isLoading}>
            <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditProfile as default };
