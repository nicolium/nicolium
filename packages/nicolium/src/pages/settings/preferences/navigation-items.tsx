import iconAddressBook from '@phosphor-icons/core/regular/address-book.svg';
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCircle from '@phosphor-icons/core/regular/circle.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconDotsSixVertical from '@phosphor-icons/core/regular/dots-six-vertical.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconFunnel from '@phosphor-icons/core/regular/funnel.svg';
import iconGauge from '@phosphor-icons/core/regular/gauge.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconMinus from '@phosphor-icons/core/regular/minus.svg';
import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconPushPinSlash from '@phosphor-icons/core/regular/push-pin-slash.svg';
import iconPushPin from '@phosphor-icons/core/regular/push-pin.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import OutlineBox from '@/components/outline-box';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import Icon from '@/components/ui/icon';
import StreamfieldPicker from '@/components/ui/streamfield-picker';
import { useFeatures } from '@/hooks/use-features';
import { NAVIGATION_ITEMS_GATE } from '@/hooks/use-navigation-items';
import {
  AVAILABLE_NAVIGATION_ITEMS,
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_PINNED_NAVIGATION_ITEMS,
} from '@/schemas/frontend-settings';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

import type { StreamfieldComponent } from '@/components/ui/streamfield';

const messages = defineMessages({
  heading: { id: 'settings.navigation_items.heading', defaultMessage: 'Navigation menu items' },
  pin: { id: 'settings.navigation_items.pin_item', defaultMessage: 'Pin item' },
  unpin: { id: 'settings.navigation_items.unpin_item', defaultMessage: 'Unpin item' },
});

const itemsMessages = {
  'search-input': {
    id: 'settings.navigation_items.item.search_input',
    defaultMessage: 'Search input',
  },
  compose: { id: 'settings.navigation_items.item.compose', defaultMessage: 'Compose button' },
  separator: { id: 'settings.navigation_items.item.separator', defaultMessage: 'Separator' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  'bubble-timeline': { id: 'tabs_bar.bubble', defaultMessage: 'Bubble' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  circle: { id: 'column.circle', defaultMessage: 'Interactions circle' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  conversations: { id: 'column.direct', defaultMessage: 'Direct messages' },
  dashboard: { id: 'column.admin.dashboard', defaultMessage: 'Dashboard' },
  directory: { id: 'column.directory', defaultMessage: 'Profile directory' },
  'domain-blocks': { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  drive: { id: 'column.drive', defaultMessage: 'Drive' },
  'edit-profile': { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  'fediverse-timeline': { id: 'tabs_bar.fediverse', defaultMessage: 'Fediverse' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  'followed-hashtags': { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
  'follow-requests': { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  groups: { id: 'column.groups', defaultMessage: 'Groups' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  'interaction-requests': {
    id: 'column.interaction_requests',
    defaultMessage: 'Interaction requests',
  },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  mutes: { id: 'column.mutes', defaultMessage: 'Mutes' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  profile: { id: 'tabs_bar.profile', defaultMessage: 'Profile' },
  'public-timeline': { id: 'tabs_bar.local', defaultMessage: 'Local' },
  'scheduled-statuses': { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  'rss-feed-subscriptions': {
    id: 'column.rss_feed_subscriptions',
    defaultMessage: 'Subscribed RSS feeds',
  },
  search: { id: 'column.search', defaultMessage: 'Search' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  'wrenched-timeline': { id: 'tabs_bar.wrenched', defaultMessage: 'Wrenched' },
};

const itemsIcons: Record<(typeof AVAILABLE_NAVIGATION_ITEMS)[number], string> = {
  antennas: iconBroadcast,
  blocks: iconProhibit,
  bookmarks: iconBookmarks,
  'bubble-timeline': iconGraph,
  chats: iconChatsTeardrop,
  circle: iconCircle,
  circles: iconCirclesThree,
  conversations: iconEnvelopeSimple,
  dashboard: iconGauge,
  directory: iconAddressBook,
  'domain-blocks': iconProhibit,
  drafts: iconPencilSimple,
  drive: iconCloud,
  'edit-profile': iconUser,
  events: iconCalendarDots,
  'fediverse-timeline': iconFediverseLogo,
  filters: iconFunnel,
  'followed-hashtags': iconHash,
  'follow-requests': iconUserPlus,
  groups: iconUsersThree,
  home: iconHouse,
  'interaction-requests': iconHeartHalf,
  lists: iconListDashes,
  mutes: iconBellSimple,
  notifications: iconBellSimple,
  profile: iconUser,
  'public-timeline': iconPlanet,
  'scheduled-statuses': iconHourglass,
  'rss-feed-subscriptions': iconRss,
  search: iconMagnifyingGlass,
  settings: iconSlidersHorizontal,
  'wrenched-timeline': iconWrench,
  compose: iconNotePencil,
  'search-input': iconMagnifyingGlass,
  separator: iconMinus,
};

const UNPINNABLE_ITEMS: (typeof AVAILABLE_NAVIGATION_ITEMS)[number][] = [
  'separator',
  'search-input',
];

const NavigationItem: StreamfieldComponent<(typeof AVAILABLE_NAVIGATION_ITEMS)[number]> = ({
  value,
  index,
}) => {
  const intl = useIntl();

  const pinnedNavigationItems = useSettings().pinnedNavigationItems;
  const pinned = pinnedNavigationItems.includes(value);

  const canPin = index !== -1 && !UNPINNABLE_ITEMS.includes(value);

  return (
    <div className='⁂-interface-item'>
      <Icon className='⁂-interface-item__drag-handle' src={iconDotsSixVertical} aria-hidden />
      <Icon className='⁂-interface-item__icon' src={itemsIcons[value]} aria-hidden />
      <p>{intl.formatMessage(itemsMessages[value])}</p>
      {canPin && (
        <button
          className='⁂-interface-item__pin'
          type='button'
          aria-label={
            pinned ? intl.formatMessage(messages.unpin) : intl.formatMessage(messages.pin)
          }
          title={pinned ? intl.formatMessage(messages.unpin) : intl.formatMessage(messages.pin)}
          aria-pressed={pinned}
          onClick={() =>
            changeSetting(
              ['pinnedNavigationItems'],
              pinned
                ? pinnedNavigationItems.filter((item) => item !== value)
                : [...pinnedNavigationItems, value],
            )
          }
        >
          <Icon src={pinned ? iconPushPinSlash : iconPushPin} aria-hidden />
        </button>
      )}
    </div>
  );
};

const NavigationItems: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();

  const settings = useSettings();

  const availableItems = AVAILABLE_NAVIGATION_ITEMS.filter(
    (item) => item === 'separator' || !settings.navigationItems.includes(item),
  ).filter(
    (item) =>
      NAVIGATION_ITEMS_GATE[item] === undefined ||
      NAVIGATION_ITEMS_GATE[item](features, instance, true),
  );

  const reset = () => {
    changeSetting(['navigationItems'], DEFAULT_NAVIGATION_ITEMS);
    changeSetting(['pinnedNavigationItems'], DEFAULT_PINNED_NAVIGATION_ITEMS);
  };

  return (
    <Column title={intl.formatMessage(messages.heading)}>
      <Form>
        <OutlineBox className='⁂-interface-items__explanation'>
          <FormattedMessage
            id='settings.navigation_items.description'
            defaultMessage='You can decide what items are visible in your navigation menu. Pinned items are shown in the bottom navigation bar on smaller displays.'
          />
        </OutlineBox>

        <StreamfieldPicker
          className='⁂-interface-items'
          component={NavigationItem}
          values={settings.navigationItems}
          availableValues={availableItems}
          getItemKey={(item, index) => (item === 'separator' ? `separator-${index}` : item)}
          onChange={(values) => changeSetting(['navigationItems'], values)}
          availableTitle={
            <FormattedMessage
              id='settings.navigation_items.available'
              defaultMessage='Available items'
            />
          }
        />

        <FormActions>
          <Button theme='secondary' onClick={reset}>
            <FormattedMessage id='settings.interface_items.reset' defaultMessage='Reset' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { NavigationItems as default };
