import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
  type NativeStackHeaderProps,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import {
  BroadcastIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CirclesThreeIcon,
  DotsThreeVerticalIcon,
  FediverseLogoIcon,
  GlobeSimpleIcon,
  GraphIcon,
  HouseIcon,
  ListDashesIcon,
  ListIcon,
  PlanetIcon,
  WrenchIcon,
  type Icon,
} from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Menu,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { Status } from '@/components/status';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useTimeline } from '@/queries/timelines/use-timeline';
import { useClient, useFeatures, useInstance } from '@/stores/auth';

import type { TimelineStackParams } from '../router';
import type { TimelineEntry } from '@/stores/timelines';

const messages = defineMessages({
  homeTimeline: { id: 'column.home', defaultMessage: 'Home' },
  followingTimeline: { id: 'column.following_timeline', defaultMessage: 'Following timeline' },
  localTimeline: { id: 'column.community', defaultMessage: 'Local timeline' },
  bubbleTimeline: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  federatedTimeline: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  wrenchedTimeline: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  pinnedInstances: { id: 'timeline_picker.pinned_instances', defaultMessage: 'Pinned instances' },
});

const useTimelineHeadingAndIcon = (active: ITimelinePicker['active'] | null): [string, Icon] => {
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
  const theme = useTheme();
  const features = useFeatures();
  const instance = useInstance();
  const timelineAccess = instance.configuration.timelines_access;

  const [heading, TimelineIcon] = useTimelineHeadingAndIcon(active);

  const [showTimelineMenu, setShowTimelineMenu] = React.useState(false);
  const [menuPage, setMenuPage] = React.useState<'timelines' | 'lists'>('timelines');

  const { data: lists } = useLists(menuPage === 'lists');

  let menuContent;

  switch (menuPage) {
    case 'timelines': {
      menuContent = (
        <>
          <Menu.Item
            onPress={() => navigation.navigate('home')}
            title={<FormattedMessage id='column.home' defaultMessage='Home' />}
            leadingIcon={HouseIcon}
          />
          {features.publicTimeline && timelineAccess.live_feeds.local !== 'disabled' && (
            <Menu.Item
              onPress={() => navigation.navigate('local')}
              title={<FormattedMessage id='column.community' defaultMessage='Local timeline' />}
              leadingIcon={PlanetIcon}
            />
          )}
          {features.bubbleTimeline && timelineAccess.live_feeds.bubble !== 'disabled' && (
            <Menu.Item
              onPress={() => navigation.navigate('bubble')}
              title={<FormattedMessage id='column.bubble' defaultMessage='Bubble timeline' />}
              leadingIcon={GraphIcon}
            />
          )}
          {features.publicTimeline && timelineAccess.live_feeds.remote !== 'disabled' && (
            <Menu.Item
              onPress={() => navigation.navigate('federated')}
              title={<FormattedMessage id='column.public' defaultMessage='Fediverse timeline' />}
              leadingIcon={FediverseLogoIcon}
            />
          )}
          {(features.lists || features.circles || features.antennas) && <Divider />}
          {features.lists && (
            <Menu.Item
              onPress={() => {
                setMenuPage('lists');
              }}
              title='Lists'
              contentStyle={{ flex: 1 }}
              leadingIcon={ListIcon}
              trailingIcon={CaretRightIcon}
            />
          )}
        </>
      );
      break;
    }
    case 'lists': {
      menuContent = (
        <>
          <Menu.Item
            leadingIcon={CaretLeftIcon}
            onPress={() => setMenuPage('timelines')}
            title='Back'
          />
          <Divider />
          {lists ? (
            lists.length ? (
              lists.map((list) => (
                <Menu.Item
                  key={list.id}
                  onPress={() => navigation.navigate('list', { id: list.id })}
                  title={list.title}
                  leadingIcon={ListDashesIcon}
                />
              ))
            ) : (
              <Menu.Item title='You have no lists yet.' />
            )
          ) : (
            <ActivityIndicator style={{ paddingVertical: 8 }} />
          )}
        </>
      );
      break;
    }
  }

  return (
    <View style={{ display: 'flex', alignItems: 'flex-start' }}>
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
              <TimelineIcon color={theme.colors.onSurface.toString()} />
              <View>
                <Text variant='titleLarge' accessible accessibilityRole='header'>
                  {heading}
                </Text>
              </View>
              <CaretDownIcon size={16} />
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

const TimelineHeader = ({ navigation, route }: NativeStackHeaderProps) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const activeKey = route.params?.id ? `${route.name}:${route.params.id}` : route.name;

  return (
    <Appbar.Header>
      <Appbar.Content title={<TimelinePicker navigation={navigation} active={activeKey} />} />

      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <Appbar.Action
            icon={DotsThreeVerticalIcon}
            onPress={() => setShowMenu((value) => !value)}
          />
        }
        anchorPosition='bottom'
      >
        <Menu.Item onPress={() => navigation.navigate('settings')} title='Settings' />
        <Menu.Item onPress={() => {}} title='Announcements' />
        {/* <Menu.Item onPress={() => {}} title='Edit timelines' /> */}
      </Menu>
    </Appbar.Header>
  );
};

interface ITimeline {
  query: ReturnType<typeof useTimeline>;
}

const Timeline: React.FC<ITimeline> = ({ query }) => {
  return (
    <FlashList
      data={query.entries}
      renderItem={({ item }) =>
        item.type === 'status' ? (
          <TouchableRipple onPress={() => {}} key={item.id} style={{ padding: 16 }}>
            <Status.FromServer id={item.id} isConnectedBottom={item.isConnectedBottom} />
          </TouchableRipple>
        ) : null
      }
      ItemSeparatorComponent={({ leadingItem }: { leadingItem: TimelineEntry }) => {
        if (leadingItem.type === 'status' && leadingItem.isConnectedBottom) return null;
        return <Divider />;
      }}
      onRefresh={query.refetch}
      onEndReached={query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined}
      onEndReachedThreshold={0.1}
      ListFooterComponent={
        query.isFetching && !query.isPending ? (
          <ActivityIndicator style={{ marginVertical: 8 }} />
        ) : undefined
      }
    />
  );
};

const HomeTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'home'>> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('home', (params) => client.timelines.homeTimeline(params));

  return <Timeline query={timelineQuery} />;
};

const LocalTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'local'>> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('public:local', (paginationParams) =>
    client.timelines.publicTimeline({ ...paginationParams, local: true }),
  );

  return <Timeline query={timelineQuery} />;
};

const BubbleTimelineScreen: React.FC<
  NativeStackScreenProps<TimelineStackParams, 'bubble'>
> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('bubble', (paginationParams) =>
    client.timelines.bubbleTimeline(paginationParams),
  );

  return <Timeline query={timelineQuery} />;
};

const FederatedTimelineScreen: React.FC<
  NativeStackScreenProps<TimelineStackParams, 'federated'>
> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('public', (paginationParams) =>
    client.timelines.publicTimeline(paginationParams),
  );

  return <Timeline query={timelineQuery} />;
};

const ListTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'list'>> = ({
  route,
}) => {
  const client = useClient();

  const timelineQuery = useTimeline(`list:${route.params.id}`, (paginationParams) =>
    client.timelines.listTimeline(route.params.id, paginationParams),
  );

  return <Timeline query={timelineQuery} />;
};

const HomeStack = createNativeStackNavigator<TimelineStackParams>();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{ header: TimelineHeader, animation: 'slide_from_right' }}>
      <HomeStack.Screen
        name='home'
        component={HomeTimelineScreen}
        options={{ animation: 'slide_from_left' }}
      />
      <HomeStack.Screen name='local' component={LocalTimelineScreen} />
      <HomeStack.Screen name='bubble' component={BubbleTimelineScreen} />
      <HomeStack.Screen name='federated' component={FederatedTimelineScreen} />
      <HomeStack.Screen name='list' component={ListTimelineScreen} />
    </HomeStack.Navigator>
  );
};

export { HomeStackScreen };
