import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting as defaultChangeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import { useFeatures } from '@/hooks/use-features';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

import type { ISettingsPage } from '@/pages/dashboard/components/frontend-config/default-setings-wrapper';

const messages = defineMessages({
  heading: { id: 'preferences.heading.compose', defaultMessage: 'Compose settings' },
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
  contentTypeWysiwyg: {
    id: 'preferences.options.content_type_wysiwyg',
    defaultMessage: 'WYSIWYG',
  },
});

const ComposePreferences: React.FC<ISettingsPage> = ({
  changeSetting = defaultChangeSetting,
  settings: settingsProp,
  onSave,
  disabled,
}) => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const userSettings = useSettings();

  const settings = settingsProp || userSettings;

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    changeSetting(path, event.target.value, { showAlert: true });
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  const defaultPrivacyOptions = React.useMemo(
    () => ({
      public: intl.formatMessage(messages.privacyPublic),
      unlisted: intl.formatMessage(messages.privacyUnlisted),
      private: intl.formatMessage(messages.privacyFollowersOnly),
    }),
    [settings.locale],
  );

  const defaultContentTypeOptions = React.useMemo(() => {
    const postFormats = instance.pleroma.metadata.post_formats;

    const options = Object.entries({
      'text/plain': intl.formatMessage(messages.contentTypePlaintext),
      'text/markdown': intl.formatMessage(messages.contentTypeMarkdown),
      'text/html': intl.formatMessage(messages.contentTypeHtml),
    }).filter(([key]) => postFormats.includes(key));

    if (postFormats.includes('text/markdown'))
      options.push(['wysiwyg', intl.formatMessage(messages.contentTypeWysiwyg)]);

    if (options.length > 1) return Object.fromEntries(options);
  }, [settings.locale]);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        <List>
          {features.privacyScopes && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.privacy.label'
                  defaultMessage='Default post privacy'
                />
              }
            >
              <SelectDropdown
                className='max-w-[200px]'
                items={defaultPrivacyOptions}
                defaultValue={settings.defaultPrivacy}
                onChange={(event) => {
                  onSelectChange(event, ['defaultPrivacy']);
                }}
              />
            </ListItem>
          )}

          {features.richText && !!defaultContentTypeOptions && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.content_type.label'
                  defaultMessage='Default post format'
                />
              }
            >
              <SelectDropdown
                className='max-w-[200px]'
                items={defaultContentTypeOptions}
                defaultValue={settings.defaultContentType}
                onChange={(event) => {
                  onSelectChange(event, ['defaultContentType']);
                }}
              />
            </ListItem>
          )}

          {features.spoilers && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.preserve_spoilers.label'
                  defaultMessage='Preserve content warning when replying'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['preserveSpoilers']}
                onChange={onToggleChange}
              />
            </ListItem>
          )}

          {features.createStatusExplicitAddressing && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.implicit_addressing.label'
                  defaultMessage='Include mentions in post content when replying'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['forceImplicitAddressing']}
                onChange={onToggleChange}
              />
            </ListItem>
          )}

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.use_dedicated_compose_page'
                defaultMessage='Open compose in a separate window'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.use_dedicated_compose_page.hint'
                defaultMessage='Only applies to non-touch devices.'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['useDedicatedComposePage']}
              onChange={onToggleChange}
            />
          </ListItem>
        </List>

        <List>
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.boost_modal.label'
                defaultMessage='Show confirmation dialog before reposting'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['boostModal']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.delete_modal.label'
                defaultMessage='Show confirmation dialog before deleting a post'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['deleteModal']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.missing_description_modal.label'
                defaultMessage='Show confirmation dialog before sending a post without media descriptions'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['missingDescriptionModal']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.missing_description_boost_modal.label'
                defaultMessage='Show confirmation dialog before reposting a post without media descriptions'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['missingDescriptionBoostModal']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.unfollow_modal.label'
                defaultMessage='Show confirmation dialog before unfollowing someone'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['unfollowModal']}
              onChange={onToggleChange}
            />
          </ListItem>

          {settings.statusActionBarItems.includes('wrench') && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.wrench_modal.label'
                  defaultMessage='Show confirmation dialog before adding wrench reaction'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.wrench_modal.hint'
                  defaultMessage='Prevents the consequences of accidentally using the wrench button.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['wrenchModal']}
                onChange={onToggleChange}
              />
            </ListItem>
          )}
        </List>

        {onSave && (
          <FormActions>
            <Button type='submit' disabled={disabled} onClick={onSave}>
              <FormattedMessage id='common.save' defaultMessage='Save' />
            </Button>
          </FormActions>
        )}
      </Form>
    </Column>
  );
};

export { ComposePreferences as default };
