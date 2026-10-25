import { Button, Icon, Text } from '@mkljczk/react-native-paper';
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
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { CreateListDialog } from '@/components/create-list-dialog';
import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';

import type { TimelineStackParams } from '../router';
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
  const timelineAccess = instance.configuration.timelines_access;

  const [createDialog, setCreateDialog] = useState<
    'bookmark_folder' | 'antenna' | 'circle' | 'list' | null
  >(null);

  const [heading, TimelineIcon] = useTimelineHeadingAndIcon(active);

  // const [menuPage, setMenuPage] = React.useState<
  //   'timelines' | 'bookmarks' | 'lists' | 'circles' | 'antennas'
  // >('timelines');

  const { data: bookmarkFolders } = useBookmarkFolders(); // menuPage === 'bookmarks');
  const { data: lists } = useLists(); // menuPage === 'lists');
  const { data: antennas } = useAntennas(); // menuPage === 'antennas');
  const { data: circles } = useCircles(); // menuPage === 'circles');

  const getTimelineItem = (
    value: string,
    icon: SFSymbol,
    androidIcon: string,
    title: MessageDescriptor,
    handleSelect: () => void,
  ) => (
    <DropdownMenu.CheckboxItem key={value} value={active === value} onSelect={handleSelect}>
      <DropdownMenu.ItemIcon ios={{ name: icon }} androidIconName={androidIcon} />
      <DropdownMenu.ItemTitle>{intl.formatMessage(title)}</DropdownMenu.ItemTitle>
    </DropdownMenu.CheckboxItem>
  );

  const getBookmarksMenu = () => {
    return (
      <DropdownMenu.Sub key='bookmarks'>
        <DropdownMenu.SubTrigger key='bookmarks}-sub'>
          <DropdownMenu.ItemIcon ios={{ name: 'bookmark' }} androidIconName='ph_bookmarks' />
          <DropdownMenu.ItemTitle>{intl.formatMessage(messages.bookmarks)}</DropdownMenu.ItemTitle>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          <DropdownMenu.Item
            key='bookmarks:all'
            onSelect={() =>
              navigation.navigate('bookmarks', {
                screen: 'all',
              })
            }
          >
            <DropdownMenu.ItemIcon ios={{ name: 'bookmark' }} androidIconName='ph_bookmarks' />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.allBookmarks)}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          {bookmarkFolders ? (
            bookmarkFolders.length ? (
              bookmarkFolders.map((folder) => (
                <DropdownMenu.Item
                  key={`bookmarks:${folder.id}`}
                  onSelect={() =>
                    navigation.navigate('bookmarks', {
                      screen: 'folder',
                      params: { id: folder.id },
                    })
                  }
                >
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'folder' }}
                    androidIconName='ph_folder_simple'
                  />
                  <DropdownMenu.ItemTitle>{folder.name}</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              ))
            ) : (
              <DropdownMenu.Item key='bookmarks-empty' disabled>
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(messages.noBookmarkFolders)}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            )
          ) : (
            <DropdownMenu.Item key='bookmarks-loading' disabled>
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.loading)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            key='bookmarks-create'
            onSelect={() => setCreateDialog('bookmark_folder')}
          >
            <DropdownMenu.ItemIcon ios={{ name: 'plus' }} androidIconName='ph_plus' />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.addBookmarkFolder)}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    );
  };

  const getListsSubMenu = (
    name: 'list' | 'antenna' | 'circle',
    lists?: Array<{ id: string; title: string }>,
  ) => {
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

    return (
      <DropdownMenu.Sub key={name}>
        <DropdownMenu.SubTrigger key={`${name}-sub`}>
          <DropdownMenu.ItemIcon ios={{ name: sfIcon }} androidIconName={androidIcon} />
          <DropdownMenu.ItemTitle>{intl.formatMessage(title)}</DropdownMenu.ItemTitle>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          {lists ? (
            lists.length ? (
              lists.map((list) => (
                <DropdownMenu.CheckboxItem
                  key={`${name}:${list.id}`}
                  value={active === `${name}:${list.id}`}
                  onSelect={() => navigation.navigate(name, { id: list.id })}
                >
                  <DropdownMenu.ItemIcon ios={{ name: sfIcon }} androidIconName={androidIcon} />
                  <DropdownMenu.ItemTitle>{list.title}</DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
              ))
            ) : (
              <DropdownMenu.Item key={`${name}-empty`} disabled>
                <DropdownMenu.ItemTitle>{intl.formatMessage(emptyMessage)}</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            )
          ) : (
            <DropdownMenu.Item key={`${name}-loading`} disabled>
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.loading)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item key={`${name}-create`} onSelect={() => setCreateDialog(name)}>
            <DropdownMenu.ItemIcon ios={{ name: 'plus' }} androidIconName='ph_plus' />
            <DropdownMenu.ItemTitle>{intl.formatMessage(createTitle)}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    );
  };

  const menuContent = (
    <>
      <DropdownMenu.Group>
        {getTimelineItem('home', 'house', 'ph_house', messages.homeTimeline, () =>
          navigation.popTo('home'),
        )}
        {features.publicTimeline &&
          timelineAccess.live_feeds.local !== 'disabled' &&
          getTimelineItem('local', 'globe.desk', 'ph_planet', messages.localTimeline, () =>
            navigation.navigate('local'),
          )}
        {features.bubbleTimeline &&
          timelineAccess.live_feeds.bubble !== 'disabled' &&
          getTimelineItem('bubble', 'circle.hexagonpath', 'ph_graph', messages.bubbleTimeline, () =>
            navigation.navigate('bubble'),
          )}
        {features.publicTimeline &&
          timelineAccess.live_feeds.remote !== 'disabled' &&
          getTimelineItem('federated', 'globe', 'ph_globe_simple', messages.federatedTimeline, () =>
            navigation.navigate('federated'),
          )}
      </DropdownMenu.Group>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        {features.bookmarks &&
          (features.bookmarkFolders
            ? getBookmarksMenu()
            : getTimelineItem('bookmarks', 'bookmark', 'ph_bookmarks', messages.bookmarks, () =>
                navigation.navigate('bookmarks', { screen: 'all' }),
              ))}
        {features.conversations &&
          getTimelineItem(
            'conversations',
            'envelope',
            'ph_envelope_simple',
            messages.conversations,
            () => navigation.navigate('conversations'),
          )}
        {features.lists && getListsSubMenu('list', lists)}
        {features.antennas && getListsSubMenu('antenna', antennas)}
        {features.circles && getListsSubMenu('circle', circles)}
      </DropdownMenu.Group>
    </>
  );

  return (
    <>
      <View style={{ alignItems: 'flex-start' }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button mode='text' labelStyle={{ fontSize: 20 }} compact>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Icon source={TimelineIcon} size={24} />
                <View>
                  <Text variant='titleLarge'>{heading}</Text>
                </View>
                <Icon source={CaretDownIcon} size={16} />
              </View>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>{menuContent}</DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
      {createDialog && (
        <CreateListDialog type={createDialog} visible onDismiss={() => setCreateDialog(null)} />
      )}
    </>
  );
};

export { TimelinePicker, type ITimelinePicker };
