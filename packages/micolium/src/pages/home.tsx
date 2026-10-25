import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ComposeButton } from '@/components/compose-button';
import { useClient } from '@/contexts/current-account-context';
import { useTimeline } from '@/queries/timelines/use-timeline';

import { Timeline } from '@/components/timelines/timeline';
import { TimelineHeader } from '@/components/timelines/timeline-header';

import type { TimelineStackParams } from '@/router/router';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const useShowComposeButton = () => {
  const previousScrollOffset = React.useRef<number>(0);
  const scrollDownStartOffset = React.useRef<number>(0);

  const [showComposeButton, setShowComposeButton] = React.useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.y || event.target?.scrollTop || 0;
    if (scrollOffset < previousScrollOffset.current) {
      scrollDownStartOffset.current = scrollOffset;
      setShowComposeButton(true);
    } else if (scrollOffset <= 0) {
      setShowComposeButton(true);
    } else if (scrollOffset - scrollDownStartOffset.current > 16) {
      setShowComposeButton(false);
    }
    previousScrollOffset.current = scrollOffset;
  };

  return React.useMemo(() => ({ handleScroll, showComposeButton }), [showComposeButton]);
};

const HomeTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'home'>> = () => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline('home', (params) => client.timelines.homeTimeline(params), {
    stream: 'user',
  });

  return (
    <>
      <Timeline
        filtersKey='home'
        query={timelineQuery}
        emptyMessageHeading={
          <FormattedMessage
            id='empty_column.home.title'
            defaultMessage='You’re not following anyone yet'
          />
        }
        context='home'
        onScroll={handleScroll}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const LocalTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'local'>> = () => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(
    'public:local',
    (paginationParams) => client.timelines.publicTimeline({ ...paginationParams, local: true }),
    { stream: 'public:local' },
  );

  return (
    <>
      <Timeline
        filtersKey='local'
        query={timelineQuery}
        emptyMessageHeading={
          <FormattedMessage
            id='empty_column.community.heading'
            defaultMessage='The local timeline is empty.'
          />
        }
        emptyMessageText={
          <FormattedMessage
            id='empty_column.community.text'
            defaultMessage='Write something publicly to get the ball rolling!'
          />
        }
        onScroll={handleScroll}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const BubbleTimelineScreen: React.FC<
  NativeStackScreenProps<TimelineStackParams, 'bubble'>
> = () => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(
    'bubble',
    (paginationParams) => client.timelines.bubbleTimeline(paginationParams),
    { stream: 'buuble' },
  );

  return (
    <>
      <Timeline filtersKey='bubble' query={timelineQuery} onScroll={handleScroll} />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const FederatedTimelineScreen: React.FC<
  NativeStackScreenProps<TimelineStackParams, 'federated'>
> = () => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(
    'public',
    (paginationParams) => client.timelines.publicTimeline(paginationParams),
    { stream: 'public' },
  );

  return (
    <>
      <Timeline filtersKey='public' query={timelineQuery} onScroll={handleScroll} />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const ListTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'list'>> = ({
  route,
}) => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(
    `list:${route.params.id}`,
    (paginationParams) => client.timelines.listTimeline(route.params.id, paginationParams),
    { stream: 'list', params: { list: route.params.id } },
  );

  return (
    <>
      <Timeline
        filtersKey='list'
        query={timelineQuery}
        emptyMessageHeading={
          <FormattedMessage
            id='empty_column.list.heading'
            defaultMessage='There is nothing in this list yet.'
          />
        }
        emptyMessageText={
          <FormattedMessage
            id='empty_column.list.text'
            defaultMessage='When members of this list create new posts, they will appear here.'
          />
        }
        onScroll={handleScroll}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const AntennaTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'antenna'>> = ({
  route,
}) => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(`antenna:${route.params.id}`, (paginationParams) =>
    client.timelines.antennaTimeline(route.params.id, paginationParams),
  );

  return (
    <>
      <Timeline
        filtersKey='antenna'
        query={timelineQuery}
        emptyMessageHeading={
          <FormattedMessage
            id='empty_column.antenna.heading'
            defaultMessage='There is nothing in this antenna yet.'
          />
        }
        emptyMessageText={
          <FormattedMessage
            id='empty_column.antenna.text'
            defaultMessage='When members of this antenna create new posts, they will appear here.'
          />
        }
        onScroll={handleScroll}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const CircleTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'circle'>> = ({
  route,
}) => {
  const client = useClient();
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const timelineQuery = useTimeline(`circle:${route.params.id}`, (paginationParams) =>
    client.circles.getCircleStatuses(route.params.id, paginationParams),
  );

  return (
    <>
      <Timeline
        filtersKey='circle'
        query={timelineQuery}
        emptyMessageHeading={
          <FormattedMessage
            id='empty_column.circle.heading'
            defaultMessage='There is nothing in this circle yet.'
          />
        }
        emptyMessageText={
          <FormattedMessage
            id='empty_column.circle.text'
            defaultMessage='When members of this circle create new posts, they will appear here.'
          />
        }
        onScroll={handleScroll}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

const HomeStack = createNativeStackNavigator<TimelineStackParams>();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        header: TimelineHeader,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen
        name='home'
        component={HomeTimelineScreen}
        options={{ animation: 'slide_from_left' }}
      />
      <HomeStack.Screen name='local' component={LocalTimelineScreen} />
      <HomeStack.Screen name='bubble' component={BubbleTimelineScreen} />
      <HomeStack.Screen name='federated' component={FederatedTimelineScreen} />
      <HomeStack.Screen name='list' component={ListTimelineScreen} />
      <HomeStack.Screen name='antenna' component={AntennaTimelineScreen} />
      <HomeStack.Screen name='circle' component={CircleTimelineScreen} />
    </HomeStack.Navigator>
  );
};

export { HomeStackScreen, useShowComposeButton };
