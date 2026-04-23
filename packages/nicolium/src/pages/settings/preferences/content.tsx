import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { Multiselect } from '@/components/ui/multiselect';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import { useFeatures } from '@/hooks/use-features';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import { useIsStandalone } from '@/utils/state';

import { languages } from '../components/preferences';

const messages = defineMessages({
  heading: { id: 'preferences.heading.content', defaultMessage: 'Content settings' },
  displayPostsDefault: {
    id: 'preferences.fields.display_media.default',
    defaultMessage: 'Hide posts marked as sensitive',
  },
  displayPostsHideAll: {
    id: 'preferences.fields.display_media.hide_all',
    defaultMessage: 'Always hide media posts',
  },
  displayPostsShowAll: {
    id: 'preferences.fields.display_media.show_all',
    defaultMessage: 'Always show posts',
  },
});

const ContentPreferences: React.FC = () => {
  const features = useFeatures();
  const instance = useInstance();
  const intl = useIntl();
  const settings = useSettings();
  const standalone = useIsStandalone();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    changeSetting(path, event.target.value, { showAlert: true });
  };

  const onSelectMultiple = (selectedList: string[], path: string[]) => {
    changeSetting(
      path,
      selectedList.toSorted((a, b) => a.localeCompare(b)),
      { showAlert: true },
    );
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  const displayMediaOptions = React.useMemo(
    () => ({
      default: intl.formatMessage(messages.displayPostsDefault),
      hide_all: intl.formatMessage(messages.displayPostsHideAll),
      show_all: intl.formatMessage(messages.displayPostsShowAll),
    }),
    [settings.locale],
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        {/* <CardTitle
          title={
            <FormattedMessage id='settings.mutes_blocks' defaultMessage='Mutes and blocks' />
          }
        /> */}

        <List>
          <ListItem
            label={<FormattedMessage id='column.mutes' defaultMessage='Mutes' />}
            to='/mutes'
          />
          <ListItem
            label={<FormattedMessage id='column.blocks' defaultMessage='Blocks' />}
            to='/blocks'
          />
          {(features.filters || features.filtersV2) && (
            <ListItem
              label={<FormattedMessage id='column.filters' defaultMessage='Muted words' />}
              to='/filters'
            />
          )}
          {features.federating && (
            <ListItem
              label={<FormattedMessage id='column.domain_blocks' defaultMessage='Domain blocks' />}
              to='/domain_blocks'
            />
          )}
          {(features.interactionRequests || features.quoteApprovalPolicies) && (
            <ListItem
              label={
                <FormattedMessage
                  id='column.interaction_policies'
                  defaultMessage='Interaction policies'
                />
              }
              to='/settings/interaction_policies'
            />
          )}
        </List>

        <List>
          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.media_display_label'
                defaultMessage='Sensitive content'
              />
            }
          >
            <SelectDropdown
              className='max-w-[200px]'
              items={displayMediaOptions}
              defaultValue={settings.displayMedia}
              onChange={(event) => {
                onSelectChange(event, ['displayMedia']);
              }}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.spoilers_display_label'
                defaultMessage='Automatically expand text behind spoilers'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['displaySpoilers']}
              onChange={onToggleChange}
            />
          </ListItem>

          <ListItem
            label={
              <FormattedMessage
                id='preferences.fields.disable_user_provided_media_label'
                defaultMessage='Do not display user-provided media'
              />
            }
            hint={
              <FormattedMessage
                id='preferences.fields.disable_user_provided_media_hint'
                defaultMessage='This will hide images, videos, and other media uploaded by users and display alternative text instead.'
              />
            }
          >
            <SettingToggle
              settings={settings}
              settingPath={['disableUserProvidedMedia']}
              onChange={onToggleChange}
            />
          </ListItem>

          {features.emojiReacts && standalone && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.check_emoji_react_supports_label'
                  defaultMessage='Check whether remote hosts supports emoji reactions when reacting'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.check_emoji_react_supports_hint'
                  defaultMessage='This will expose your IP address to the instances you’re interacting with.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['checkEmojiReactsSupport']}
                onChange={onToggleChange}
              />
            </ListItem>
          )}

          {features.quotePosts && (
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.show_nested_quotes'
                  defaultMessage='Display quotes nested in other quoted posts'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.show_nested_quotes.hint'
                  defaultMessage='Up to three posts in the quote chain will be displayed.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['showNestedQuotes']}
                onChange={onToggleChange}
              />
            </ListItem>
          )}
        </List>

        {instance.pleroma.metadata.post_formats.includes('text/x.misskeymarkdown') && (
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.render_mfm_label'
                  defaultMessage='Render Misskey Flavored Markdown'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.render_mfm_hint'
                  defaultMessage='MFM support is experimental, not all node types are supported.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['renderMfm']}
                onChange={onToggleChange}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.render_advanced_mfm_label'
                  defaultMessage='Enable advanced MFM'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['renderAdvancedMfm']}
                onChange={onToggleChange}
                disabled={!settings.renderMfm}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.render_animated_mfm_label'
                  defaultMessage='Enable animated MFM'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['renderAnimatedMfm']}
                onChange={onToggleChange}
                disabled={!settings.renderMfm}
              />
            </ListItem>
          </List>
        )}

        {features.translations && (
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.auto_translate_label'
                  defaultMessage='Automatically translate posts in unknown languages'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['autoTranslate']}
                onChange={onToggleChange}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='preferences.fields.side_by_side_translations'
                  defaultMessage='Show translations next to the original post'
                />
              }
              hint={
                <FormattedMessage
                  id='preferences.fields.side_by_side_translations_hint'
                  defaultMessage='When translation is enabled, display the translation alongside the original text.'
                />
              }
            >
              <SettingToggle
                settings={settings}
                settingPath={['showSideBySideTranslations']}
                onChange={onToggleChange}
              />
            </ListItem>

            <ListItem
              className='!overflow-visible'
              label={
                <FormattedMessage
                  id='preferences.fields.known_languages_label'
                  defaultMessage='Languages you know'
                />
              }
            >
              <Multiselect
                className='max-w-[200px]'
                items={languages}
                value={settings.knownLanguages as string[] | undefined}
                onChange={(selectedList) => {
                  onSelectMultiple(selectedList, ['knownLanguages']);
                }}
                disabled={!settings.autoTranslate}
              />
            </ListItem>
          </List>
        )}
      </Form>
    </Column>
  );
};

export { ContentPreferences as default };
