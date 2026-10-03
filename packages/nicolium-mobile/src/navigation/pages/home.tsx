import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useTimeline } from '@/queries/timelines/use-timeline';
import { useClient } from '@/stores/auth';

import { Timeline } from '../components/timeline';
import { TimelineHeader } from '../components/timeline-header';

import type { TimelineStackParams } from '../router';

const HomeTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'home'>> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('home', (params) => client.timelines.homeTimeline(params));

  return (
    <Timeline
      query={timelineQuery}
      emptyMessageHeading={
        <FormattedMessage
          id='empty_column.home.title'
          defaultMessage='You’re not following anyone yet'
        />
      }
      context='home'
    />
  );
};

const LocalTimelineScreen: React.FC<NativeStackScreenProps<TimelineStackParams, 'local'>> = () => {
  const client = useClient();

  const timelineQuery = useTimeline('public:local', (paginationParams) =>
    client.timelines.publicTimeline({ ...paginationParams, local: true }),
  );

  return (
    <Timeline
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
    />
  );
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

  return (
    <Timeline
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
    />
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
    </HomeStack.Navigator>
  );
};

export { HomeStackScreen };
