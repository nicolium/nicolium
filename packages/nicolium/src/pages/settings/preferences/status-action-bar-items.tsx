import iconDotsSixVertical from '@phosphor-icons/core/regular/dots-six-vertical.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import OutlineBox from '@/components/outline-box';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import StreamfieldPicker from '@/components/ui/streamfield-picker';
import { useFeatures } from '@/hooks/use-features';
import { AVAILABLE_STATUS_ACTION_BAR_ITEMS } from '@/schemas/frontend-settings';
import { useSettings } from '@/stores/settings';

import type { StreamfieldComponent } from '@/components/ui/streamfield';

const messages = defineMessages({
  heading: {
    id: 'settings.status_action_bar_items.heading',
    defaultMessage: 'Status action items',
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

const StatusActionBarItem: StreamfieldComponent<
  (typeof AVAILABLE_STATUS_ACTION_BAR_ITEMS)[number]
> = ({ value }) => {
  const intl = useIntl();

  return (
    <div className='⁂-interface-item'>
      <Icon src={iconDotsSixVertical} aria-hidden />
      <div>
        <p>{intl.formatMessage(itemsMessages[value])}</p>
      </div>
    </div>
  );
};

const StatusActionBarItems: React.FC = () => {
  const features = useFeatures();
  const intl = useIntl();

  const settings = useSettings();

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

  return (
    <Column title={intl.formatMessage(messages.heading)}>
      <Form>
        <OutlineBox className='⁂-interface-items__explanation'>
          <FormattedMessage
            id='settings.status_action_bar_items.description'
            defaultMessage='You can decide what items are visible in your status action bar. This does not affect available functionality, they will be accessible in other ways, e.g., in the status menu.'
          />
        </OutlineBox>

        <StreamfieldPicker
          className='⁂-interface-items'
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
      </Form>
    </Column>
  );
};

export { StatusActionBarItems as default };
