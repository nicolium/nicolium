import { Icon, Text } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { BroadcastIcon } from 'phosphor-react-native/src/icons/Broadcast';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CirclesFourIcon } from 'phosphor-react-native/src/icons/CirclesFour';
import { FediverseLogoIcon } from 'phosphor-react-native/src/icons/FediverseLogo';
import { GlobeSimpleIcon } from 'phosphor-react-native/src/icons/GlobeSimple';
import { GraphIcon } from 'phosphor-react-native/src/icons/Graph';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { ListDashesIcon } from 'phosphor-react-native/src/icons/ListDashes';
import { PlanetIcon } from 'phosphor-react-native/src/icons/Planet';
import { WrenchIcon } from 'phosphor-react-native/src/icons/Wrench';
import React, { useMemo, useState } from 'react';
import { defineMessages, type MessageDescriptor, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';

import { CreateListDialog } from '@/components/create-list-dialog';
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';

import type { TimelineStackParams } from '@/router/router';
import type { SFSymbol } from '@/utils/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';

const messages = defineMessages({
  homeTimeline: { id: 'column.home', defaultMessage: 'Home' },
  localTimeline: { id: 'column.community', defaultMessage: 'Local timeline' },
  bubbleTimeline: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  federatedTimeline: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  wrenchedTimeline: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  conversations: { id: 'column.direct', defaultMessage: 'Conversations' },
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
  loading: { id: 'loading_indicator.label', defaultMessage: 'Loading…' },
  addList: { id: 'lists.new.create', defaultMessage: 'Add list' },
  addAntenna: { id: 'antennas.new.create', defaultMessage: 'Add antenna' },
  addCircle: { id: 'circles.new.create', defaultMessage: 'Add circle' },
  addBookmarkFolder: { id: 'bookmark_folders.new.create', defaultMessage: 'Add bookmark folder' },
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
          return [circle?.title ?? '', CirclesFourIcon];
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
  const glassEffect = useEnableLiquidGlass();
  const rootNavigation = useNavigation();
  const timelineAccess = instance.configuration.timelines_access;

  const MaybeGlassView = glassEffect ? GlassView : View;

  const [createDialog, setCreateDialog] = useState<
    'bookmark_folder' | 'antenna' | 'circle' | 'list' | null
  >(null);

  const [heading, TimelineIcon] = useTimelineHeadingAndIcon(active);

  const { data: bookmarkFolders } = useBookmarkFolders();
  const { data: lists } = useLists();
  const { data: antennas } = useAntennas();
  const { data: circles } = useCircles();

  const getTimelineItem = (
    value: 'home' | 'local' | 'bubble' | 'federated',
    appleIcon: SFSymbol,
    androidIcon: string,
    title: MessageDescriptor,
  ): DropdownMenuItem => ({
    key: value,
    type: 'button',
    onPress: () => navigation.popTo(value),
    label: intl.formatMessage(title),
    appleIcon,
    androidIcon,
    checked: active === value,
  });

  const getPlaceholderItem = (key: string, title: MessageDescriptor): DropdownMenuItem => ({
    key,
    type: 'button',
    onPress: () => {},
    label: intl.formatMessage(title),
    disabled: true,
  });

  const getBookmarksMenu = (): DropdownMenuItem => {
    const children: Array<DropdownMenuItem> = [
      {
        key: 'bookmarks:all',
        type: 'button',
        onPress: () => rootNavigation.navigate('bookmarks', { screen: 'all' }),
        label: intl.formatMessage(messages.allBookmarks),
        appleIcon: 'bookmark',
        androidIcon: 'ph_bookmarks',
      },
    ];

    if (!bookmarkFolders) {
      children.push(getPlaceholderItem('bookmarks-loading', messages.loading));
    } else if (!bookmarkFolders.length) {
      children.push(getPlaceholderItem('bookmarks-empty', messages.noBookmarkFolders));
    } else {
      children.push(
        ...bookmarkFolders.map((folder): DropdownMenuItem => ({
          key: `bookmarks:${folder.id}`,
          type: 'button',
          onPress: () =>
            rootNavigation.navigate('bookmarks', {
              screen: 'folder',
              params: { id: folder.id },
            }),
          label: folder.name,
          appleIcon: 'folder',
          androidIcon: 'ph_folder_simple',
        })),
      );
    }

    children.push({
      key: 'bookmarks-create',
      type: 'button',
      onPress: () => setCreateDialog('bookmark_folder'),
      label: intl.formatMessage(messages.addBookmarkFolder),
      appleIcon: 'plus',
      androidIcon: 'ph_plus',
    });

    return {
      key: 'bookmarks',
      type: 'menu',
      label: intl.formatMessage(messages.bookmarks),
      appleIcon: 'bookmark',
      androidIcon: 'ph_bookmarks',
      children,
    };
  };

  const getListsSubMenu = (
    name: 'list' | 'antenna' | 'circle',
    lists?: Array<{ id: string; title: string }>,
  ): DropdownMenuItem => {
    let title: MessageDescriptor;
    let sfIcon: SFSymbol;
    let androidIcon: string;
    let emptyMessage;
    let createTitle;

    switch (name) {
      case 'antenna':
        sfIcon = 'antenna.radiowaves.left.and.right';
        androidIcon = 'ph_broadcast';
        emptyMessage = messages.noAntennas;
        title = messages.antennas;
        createTitle = messages.addAntenna;
        break;
      case 'circle':
        sfIcon = 'circle.grid.2x2';
        androidIcon = 'ph_circles_four';
        emptyMessage = messages.noCircles;
        title = messages.circles;
        createTitle = messages.addCircle;
        break;
      default:
        sfIcon = 'list.bullet';
        androidIcon = 'ph_list_dashes';
        emptyMessage = messages.noLists;
        title = messages.lists;
        createTitle = messages.addList;
        break;
    }

    const children: Array<DropdownMenuItem> = [];

    if (!lists) {
      children.push(getPlaceholderItem(`${name}-loading`, messages.loading));
    } else if (!lists.length) {
      children.push(getPlaceholderItem(`${name}-empty`, emptyMessage));
    } else {
      children.push(
        ...lists.map((list): DropdownMenuItem => ({
          key: `${name}:${list.id}`,
          type: 'button',
          onPress: () => navigation.navigate(name, { id: list.id }),
          label: list.title,
          appleIcon: sfIcon,
          androidIcon,
          checked: active === `${name}:${list.id}`,
        })),
      );
    }

    children.push({
      key: `${name}-create`,
      type: 'button',
      onPress: () => setCreateDialog(name),
      label: intl.formatMessage(createTitle),
      appleIcon: 'plus',
      androidIcon: 'ph_plus',
    });

    return {
      key: name,
      type: 'menu',
      label: intl.formatMessage(title),
      appleIcon: sfIcon,
      androidIcon,
      children,
    };
  };

  const getMenuItems = () => {
    const timelines: Array<DropdownMenuItem> = [
      getTimelineItem('home', 'house', 'ph_house', messages.homeTimeline),
    ];

    if (features.publicTimeline && timelineAccess.live_feeds.local !== 'disabled') {
      timelines.push(getTimelineItem('local', 'globe.desk', 'ph_planet', messages.localTimeline));
    }
    if (features.bubbleTimeline && timelineAccess.live_feeds.bubble !== 'disabled') {
      timelines.push(
        getTimelineItem('bubble', 'circle.hexagonpath', 'ph_graph', messages.bubbleTimeline),
      );
    }
    if (features.publicTimeline && timelineAccess.live_feeds.remote !== 'disabled') {
      timelines.push(
        getTimelineItem('federated', 'globe', 'ph_globe_simple', messages.federatedTimeline),
      );
    }

    const other: Array<DropdownMenuItem> = [];

    if (features.bookmarks) {
      other.push(
        features.bookmarkFolders
          ? getBookmarksMenu()
          : {
              key: 'bookmarks',
              type: 'button',
              onPress: () => rootNavigation.navigate('bookmarks', { screen: 'all' }),
              label: intl.formatMessage(messages.bookmarks),
              appleIcon: 'bookmark',
              androidIcon: 'ph_bookmarks',
            },
      );
    }
    if (features.conversations) {
      other.push({
        key: 'conversations',
        type: 'button',
        onPress: () => rootNavigation.navigate('conversations', { screen: 'index' }),
        label: intl.formatMessage(messages.conversations),
        appleIcon: 'envelope',
        androidIcon: 'ph_envelope_simple',
      });
    }
    if (features.lists) other.push(getListsSubMenu('list', lists));
    if (features.antennas) other.push(getListsSubMenu('antenna', antennas));
    if (features.circles) other.push(getListsSubMenu('circle', circles));

    const items: Array<DropdownMenuItem> = [
      { key: 'timelines', type: 'section', children: timelines },
    ];

    if (other.length) items.push({ key: 'other', type: 'section', children: other });

    return items;
  };

  return (
    <>
      <View style={{ alignItems: 'flex-start' }}>
        <DropdownMenu
          trigger={
            <Pressable>
              <MaybeGlassView
                style={[
                  {
                    flexDirection: 'row',
                    gap: 8,
                    alignItems: 'center',
                  },
                  glassEffect
                    ? {
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 40,
                        borderCurve: 'continuous',
                      }
                    : undefined,
                ]}
                isInteractive
              >
                <Icon source={TimelineIcon} size={24} />
                <View>
                  <Text variant='titleLarge'>{heading}</Text>
                </View>
                <Icon source={CaretDownIcon} size={16} />
              </MaybeGlassView>
            </Pressable>
          }
          items={getMenuItems()}
        />
      </View>
      {createDialog && (
        <CreateListDialog type={createDialog} visible onDismiss={() => setCreateDialog(null)} />
      )}
    </>
  );
};

export { TimelinePicker, type ITimelinePicker };
