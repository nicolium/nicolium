import iconArrowBendUpLeft from '@phosphor-icons/core/regular/arrow-bend-up-left.svg';
import iconBookmark from '@phosphor-icons/core/regular/bookmark.svg';
import iconDotsSixVertical from '@phosphor-icons/core/regular/dots-six-vertical.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconSmiley from '@phosphor-icons/core/regular/smiley.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import iconThumbsDown from '@phosphor-icons/core/regular/thumbs-down.svg';
import iconTranslate from '@phosphor-icons/core/regular/translate.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting as defaultChangeSetting } from '@/actions/settings';
import OutlineBox from '@/components/outline-box';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import StreamfieldPicker from '@/components/ui/streamfield-picker';
import { useFeatures } from '@/hooks/use-features';
import {
  AVAILABLE_STATUS_ACTION_BAR_ITEMS,
  DEFAULT_STATUS_ACTION_BAR_ITEMS,
} from '@/schemas/frontend-settings';
import { useDefaultSettings, useSettings } from '@/stores/settings';
import toast from '@/toast';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { ISettingsPage } from '@/pages/dashboard/components/frontend-config/default-setings-wrapper';

const messages = defineMessages({
  heading: {
    id: 'settings.status_action_bar_items.heading',
    defaultMessage: 'Post action items',
  },
  resetSuccess: {
    id: 'settings.status_action_bar_items.reset.success',
    defaultMessage: 'Post action items reset to default',
  },
});

const itemsMessages = {
  reply: { id: 'settings.status_action_bar_items.item.reply', defaultMessage: 'Reply' },
  reblog: { id: 'settings.status_action_bar_items.item.reblog', defaultMessage: 'Reblog' },
  quote: { id: 'settings.status_action_bar_items.item.quote', defaultMessage: 'Quote' },
  favourite: { id: 'settings.status_action_bar_items.item.favourite', defaultMessage: 'Favourite' },
  dislike: { id: 'settings.status_action_bar_items.item.dislike', defaultMessage: 'Dislike' },
  wrench: { id: 'settings.status_action_bar_items.item.wrench', defaultMessage: 'Wrench reaction' },
  reaction: { id: 'settings.status_action_bar_items.item.reaction', defaultMessage: 'React' },
  bookmark: { id: 'settings.status_action_bar_items.item.bookmark', defaultMessage: 'Bookmark' },
  share: { id: 'settings.status_action_bar_items.item.share', defaultMessage: 'Share' },
  translate: { id: 'settings.status_action_bar_items.item.translate', defaultMessage: 'Translate' },
};

const itemsIcons = {
  reply: iconArrowBendUpLeft,
  reblog: iconRepeat,
  quote: iconQuotes,
  favourite: iconStar,
  dislike: iconThumbsDown,
  wrench: iconWrench,
  reaction: iconSmiley,
  bookmark: iconBookmark,
  share: iconExport,
  translate: iconTranslate,
};

const StatusActionBarItem: StreamfieldComponent<
  (typeof AVAILABLE_STATUS_ACTION_BAR_ITEMS)[number]
> = ({ value }) => {
  const intl = useIntl();

  return (
    <div className='interface-item'>
      <Icon className='interface-item__drag-handle' src={iconDotsSixVertical} aria-hidden />
      <Icon className='interface-item__icon' src={itemsIcons[value]} aria-hidden />
      <div>
        <p>{intl.formatMessage(itemsMessages[value])}</p>
      </div>
    </div>
  );
};

const StatusActionBarItems: React.FC<ISettingsPage> = ({
  changeSetting = defaultChangeSetting,
  settings: settingsProp,
  onSave,
  disabled,
}) => {
  const features = useFeatures();
  const intl = useIntl();
  const defaultSettings = useDefaultSettings();

  const userSettings = useSettings();
  const settings = settingsProp || userSettings;

  const availableItems = {
    reply: true,
    reblog: true,
    quote: features.quotePosts,
    favourite: true,
    dislike: features.statusDislikes,
    wrench: features.emojiReacts,
    reaction: features.emojiReacts,
    bookmark: features.bookmarks,
    share: true,
    translate: features.translations || 'Translator' in globalThis,
  };

  const unusedItems = AVAILABLE_STATUS_ACTION_BAR_ITEMS.filter(
    (item) => !settings.statusActionBarItems.includes(item) && availableItems[item],
  );

  const reset = () => {
    changeSetting(
      ['statusActionBarItems'],
      onSave ? DEFAULT_STATUS_ACTION_BAR_ITEMS : defaultSettings.statusActionBarItems,
    );
    toast.success(messages.resetSuccess);
  };

  return (
    <Column title={intl.formatMessage(messages.heading)}>
      <Form>
        <OutlineBox className='interface-items__explanation'>
          <FormattedMessage
            id='settings.status_action_bar_items.description'
            defaultMessage='You can decide what items are visible in your post action bar. This does not affect available functionality, they will be accessible in other ways, e.g., in the post menu.'
          />
        </OutlineBox>

        <StreamfieldPicker
          className='interface-items'
          component={StatusActionBarItem}
          values={settings.statusActionBarItems.filter((item) => availableItems[item])}
          availableValues={unusedItems}
          getItemKey={(item) => item}
          onChange={(values) => changeSetting(['statusActionBarItems'], values)}
          availableTitle={
            <FormattedMessage
              id='settings.status_action_bar_items.available'
              defaultMessage='Available items'
            />
          }
        />

        <div className='form__actions interface-items__actions'>
          <button type='button' onClick={reset}>
            <FormattedMessage id='settings.interface_items.reset' defaultMessage='Reset' />
          </button>

          {onSave && (
            <button type='submit' disabled={disabled} onClick={onSave}>
              <FormattedMessage id='common.save' defaultMessage='Save' />
            </button>
          )}
        </div>
      </Form>
    </Column>
  );
};

export { StatusActionBarItems as default };
