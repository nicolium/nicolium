import { ActivityIndicator, Button, Divider, Icon, Menu, Text } from '@mkljczk/react-native-paper';
import {
  BookmarksIcon,
  BroadcastIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CirclesThreeIcon,
  FediverseLogoIcon,
  FolderIcon,
  GlobeSimpleIcon,
  GraphIcon,
  HouseIcon,
  ListDashesIcon,
  ListIcon,
  PlanetIcon,
  WrenchIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import { iconHelper } from '@/components/ui/icon';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';

import type { TimelineStackParams } from '../router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const messages = defineMessages({
  homeTimeline: { id: 'column.home', defaultMessage: 'Home' },
  localTimeline: { id: 'column.community', defaultMessage: 'Local timeline' },
  bubbleTimeline: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  federatedTimeline: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  wrenchedTimeline: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  allBookmarks: { id: 'column.bookmarks.all', defaultMessage: 'All bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  back: { id: 'navigation_bar.back', defaultMessage: 'Back' },
  noLists: { id: 'column.lists.empty', defaultMessage: 'You have no lists yet.' },
  noAntennas: { id: 'column.antennas.empty', defaultMessage: 'You have no antennas yet.' },
  noCircles: { id: 'column.circles.empty', defaultMessage: 'You have no circles yet.' },
  noBookmarkFolders: {
    id: 'bookmark_folders.empty',
    defaultMessage: 'You have no bookmark folders yet.',
  },
});

const useTimelineHeadingAndIcon = (
  active: ITimelinePicker['active'] | null,
): [string, PhosphorIcon] => {
  const intl = useIntl();
  const { data: lists } = useLists(active?.startsWith('list:'));
  const { data: circles } = useCircles(active?.startsWith('circle:'));
  const { data: antennas } = useAntennas(active?.startsWith('antenna:'));

  return useMemo(() => {
    switch (active) {
      case 'home':
        return [intl.formatMessage(messages.homeTimeline), HouseIcon];
      case 'local':
        return [intl.formatMessage(messages.localTimeline), PlanetIcon];
      case 'bubble':
        return [intl.formatMessage(messages.bubbleTimeline), GraphIcon];
      case 'federated':
        return [intl.formatMessage(messages.federatedTimeline), FediverseLogoIcon];
      case 'wrenched':
        return [intl.formatMessage(messages.wrenchedTimeline), WrenchIcon];
      default:
        if (active?.startsWith('list:')) {
          const list = lists?.find((list) => `list:${list.id}` === active);
          return [list?.title ?? '', ListDashesIcon];
        }
        if (active?.startsWith('circle:')) {
          const circle = circles?.find((circle) => `circle:${circle.id}` === active);
          return [circle?.title ?? '', CirclesThreeIcon];
        }
        if (active?.startsWith('antenna:')) {
          const antenna = antennas?.find((antenna) => `antenna:${antenna.id}` === active);
          return [antenna?.title ?? '', BroadcastIcon];
        }
        if (active?.startsWith('instance:')) {
          return [active.replace('instance:', ''), GlobeSimpleIcon];
        }
        return ['', ListDashesIcon];
    }
  }, [active, lists, circles, antennas]);
};

interface ITimelinePicker {
  navigation: NativeStackNavigationProp<TimelineStackParams>;
  active?:
    | 'home'
    | 'local'
    | 'bubble'
    | 'federated'
    | 'wrenched'
    | `list:${string}`
    | `circle:${string}`
    | `antenna:${string}`
    | `instance:${string}`;
}

const TimelinePicker: React.FC<ITimelinePicker> = ({ navigation, active = 'home' }) => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const timelineAccess = instance.configuration.timelines_access;

  const [heading, TimelineIcon] = useTimelineHeadingAndIcon(active);

  const [showTimelineMenu, setShowTimelineMenu] = React.useState(false);
  const [menuPage, setMenuPage] = React.useState<
    'timelines' | 'bookmarks' | 'lists' | 'circles' | 'antennas'
  >('timelines');

  const { data: bookmarkFolders } = useBookmarkFolders(menuPage === 'bookmarks');
  const { data: lists } = useLists(menuPage === 'lists');
  const { data: antennas } = useAntennas(menuPage === 'antennas');
  const { data: circles } = useCircles(menuPage === 'circles');

  let menuContent;

  const closeAfter = (callback: () => void) => () => {
    callback();
    setMenuPage('timelines');
    setShowTimelineMenu(false);
  };

  const getListsMenuPage = (
    name: 'list' | 'antenna' | 'circle',
    lists?: Array<{ id: string; title: string }>,
  ) => {
    let listIcon;
    let emptyMessage;

    switch (name) {
      case 'antenna':
        listIcon = BroadcastIcon;
        emptyMessage = messages.noAntennas;
        break;
      case 'circle':
        listIcon = CirclesThreeIcon;
        emptyMessage = messages.noCircles;
        break;
      default:
        listIcon = ListDashesIcon;
        emptyMessage = messages.noLists;
        break;
    }

    return (
      <>
        <Menu.Item
          leadingIcon={iconHelper(CaretLeftIcon)}
          onPress={() => setMenuPage('timelines')}
          title={intl.formatMessage(messages.back)}
        />
        <Divider />
        {lists ? (
          lists.length ? (
            lists.map((list) => (
              <Menu.Item
                key={list.id}
                onPress={closeAfter(() => navigation.navigate(name, { id: list.id }))}
                title={list.title}
                leadingIcon={iconHelper(listIcon)}
              />
            ))
          ) : (
            <Menu.Item title={intl.formatMessage(emptyMessage)} />
          )
        ) : (
          <ActivityIndicator style={{ paddingVertical: 8 }} />
        )}
      </>
    );
  };

  switch (menuPage) {
    case 'timelines': {
      menuContent = (
        <>
          <Menu.Item
            onPress={closeAfter(() => navigation.navigate('home'))}
            title={<FormattedMessage id='column.home' defaultMessage='Home' />}
            leadingIcon={iconHelper(HouseIcon)}
          />
          {features.publicTimeline && timelineAccess.live_feeds.local !== 'disabled' && (
            <Menu.Item
              onPress={closeAfter(() => navigation.navigate('local'))}
              title={<FormattedMessage id='column.community' defaultMessage='Local timeline' />}
              leadingIcon={iconHelper(PlanetIcon)}
            />
          )}
          {features.bubbleTimeline && timelineAccess.live_feeds.bubble !== 'disabled' && (
            <Menu.Item
              onPress={closeAfter(() => navigation.navigate('bubble'))}
              title={<FormattedMessage id='column.bubble' defaultMessage='Bubble timeline' />}
              leadingIcon={iconHelper(GraphIcon)}
            />
          )}
          {features.publicTimeline && timelineAccess.live_feeds.remote !== 'disabled' && (
            <Menu.Item
              onPress={closeAfter(() => navigation.navigate('federated'))}
              title={<FormattedMessage id='column.public' defaultMessage='Fediverse timeline' />}
              leadingIcon={iconHelper(FediverseLogoIcon)}
            />
          )}
          {(features.bookmarks || features.lists || features.circles || features.antennas) && (
            <Divider />
          )}
          {features.bookmarks && (
            <Menu.Item
              onPress={() => {
                if (features.bookmarkFolders) setMenuPage('bookmarks');
                else {
                  navigation.navigate('bookmarks', {
                    screen: 'all',
                  });
                  setMenuPage('timelines');
                  setShowTimelineMenu(false);
                }
              }}
              title={intl.formatMessage(messages.bookmarks)}
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(BookmarksIcon)}
              trailingIcon={features.bookmarkFolders ? iconHelper(CaretRightIcon) : undefined}
            />
          )}
          {features.lists && (
            <Menu.Item
              onPress={() => {
                setMenuPage('lists');
              }}
              title={intl.formatMessage(messages.lists)}
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(ListIcon)}
              trailingIcon={iconHelper(CaretRightIcon)}
            />
          )}
          {features.antennas && (
            <Menu.Item
              onPress={() => {
                setMenuPage('antennas');
              }}
              title={intl.formatMessage(messages.antennas)}
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(BroadcastIcon)}
              trailingIcon={iconHelper(CaretRightIcon)}
            />
          )}
          {features.circles && (
            <Menu.Item
              onPress={() => {
                setMenuPage('circles');
              }}
              title={intl.formatMessage(messages.circles)}
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(CirclesThreeIcon)}
              trailingIcon={iconHelper(CaretRightIcon)}
            />
          )}
        </>
      );
      break;
    }
    case 'bookmarks': {
      menuContent = (
        <>
          <Menu.Item
            leadingIcon={iconHelper(CaretLeftIcon)}
            onPress={() => setMenuPage('timelines')}
            title={intl.formatMessage(messages.back)}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              navigation.navigate('bookmarks', {
                screen: 'all',
              });
              setMenuPage('timelines');
              setShowTimelineMenu(false);
            }}
            title={intl.formatMessage(messages.allBookmarks)}
            contentStyle={{ flex: 1 }}
            leadingIcon={iconHelper(BookmarksIcon)}
          />
          {bookmarkFolders ? (
            bookmarkFolders.length ? (
              bookmarkFolders.map((folder) => (
                <Menu.Item
                  key={folder.id}
                  onPress={closeAfter(() =>
                    navigation.navigate('bookmarks', {
                      screen: 'folder',
                      params: { id: folder.id },
                    }),
                  )}
                  title={folder.name}
                  leadingIcon={iconHelper(FolderIcon)}
                />
              ))
            ) : (
              <Menu.Item title={intl.formatMessage(messages.noBookmarkFolders)} />
            )
          ) : (
            <ActivityIndicator style={{ paddingVertical: 8 }} />
          )}
        </>
      );
      break;
    }
    case 'lists': {
      menuContent = getListsMenuPage('list', lists);
      break;
    }
    case 'antennas': {
      menuContent = getListsMenuPage('antenna', antennas);
      break;
    }
    case 'circles': {
      menuContent = getListsMenuPage('circle', circles);
      break;
    }
  }

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Menu
        visible={showTimelineMenu}
        onDismiss={() => setShowTimelineMenu(false)}
        anchor={
          <Button
            mode='text'
            labelStyle={{ fontSize: 20 }}
            onPress={() => setShowTimelineMenu((value) => !value)}
            compact
          >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon source={TimelineIcon} size={24} />
              <View>
                <Text variant='titleLarge'>{heading}</Text>
              </View>
              <Icon source={CaretDownIcon} size={16} />
            </View>
          </Button>
        }
        anchorPosition='bottom'
      >
        {menuContent}
      </Menu>
    </View>
  );
};

export { TimelinePicker, type ITimelinePicker };
