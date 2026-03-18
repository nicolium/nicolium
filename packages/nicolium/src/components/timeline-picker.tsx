import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

import DropdownMenu, { type Menu } from './dropdown-menu';
import Icon from './ui/icon';

const messages = defineMessages({
  homeTimeline: { id: 'column.home', defaultMessage: 'Home' },
  localTimeline: { id: 'column.community', defaultMessage: 'Local timeline' },
  bubbleTimeline: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  federatedTimeline: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  wrenchedTimeline: { id: 'column.wrenched', defaultMessage: 'Wrenched timeline' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  pinnedInstances: { id: 'timeline_picker.pinned_instances', defaultMessage: 'Pinned instances' },
});

interface ITimelinePicker {
  active:
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

const TimelinePicker: React.FC<ITimelinePicker> = ({ active }) => {
  const intl = useIntl();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const timelineAccess = useInstance().configuration.timelines_access;
  const pinnedHosts = useSettings().remote_timeline.pinnedHosts;

  const { data: lists } = useLists();
  const { data: circles } = useCircles();
  const { data: antennas } = useAntennas();

  const heading = useMemo(() => {
    switch (active) {
      case 'home':
        return intl.formatMessage(messages.homeTimeline);
      case 'local':
        return intl.formatMessage(messages.localTimeline);
      case 'bubble':
        return intl.formatMessage(messages.bubbleTimeline);
      case 'federated':
        return intl.formatMessage(messages.federatedTimeline);
      case 'wrenched':
        return intl.formatMessage(messages.wrenchedTimeline);
      default:
        if (active.startsWith('list:')) {
          const list = lists?.find((list) => `list:${list.id}` === active);
          return list?.title ?? '';
        }
        if (active.startsWith('circle:')) {
          const circle = circles?.find((circle) => `circle:${circle.id}` === active);
          return circle?.title ?? '';
        }
        if (active.startsWith('antenna:')) {
          const antenna = antennas?.find((antenna) => `antenna:${antenna.id}` === active);
          return antenna?.title ?? '';
        }
        if (active.startsWith('instance:')) {
          return active.replace('instance:', '');
        }
        return '';
    }
  }, [active, lists, circles, antennas]);

  const items = useMemo(() => {
    const items: Menu = [];

    if (isLoggedIn) {
      items.push({
        to: '/',
        text: intl.formatMessage(messages.homeTimeline),
        icon: require('@phosphor-icons/core/regular/house.svg'),
        active: active === 'home',
      });
    }

    if (
      isLoggedIn
        ? timelineAccess.live_feeds.local !== 'disabled'
        : timelineAccess.live_feeds.local === 'public'
    ) {
      items.push({
        to: '/timeline/local',
        text: intl.formatMessage(messages.localTimeline),
        icon: require('@phosphor-icons/core/regular/planet.svg'),
        active: active === 'local',
      });
    }

    if (
      features.bubbleTimeline && isLoggedIn
        ? timelineAccess.live_feeds.bubble !== 'disabled'
        : timelineAccess.live_feeds.bubble === 'public'
    ) {
      items.push({
        to: '/timeline/bubble',
        text: intl.formatMessage(messages.bubbleTimeline),
        icon: require('@phosphor-icons/core/regular/graph.svg'),
        active: active === 'bubble',
      });
    }
    if (
      features.bubbleTimeline && isLoggedIn
        ? timelineAccess.live_feeds.bubble !== 'disabled'
        : timelineAccess.live_feeds.bubble === 'public'
    ) {
      items.push({
        to: '/timeline/fediverse',
        text: intl.formatMessage(messages.federatedTimeline),
        icon: require('@phosphor-icons/core/regular/fediverse-logo.svg'),
        active: active === 'federated',
      });
    }
    if (
      features.wrenchedTimeline && isLoggedIn
        ? timelineAccess.live_feeds.wrenched !== 'disabled'
        : timelineAccess.live_feeds.wrenched === 'public'
    ) {
      items.push({
        to: '/timeline/wrenched',
        text: intl.formatMessage(messages.wrenchedTimeline),
        icon: require('@phosphor-icons/core/regular/wrench.svg'),
        active: active === 'wrenched',
      });
    }
    if (lists?.length) {
      items.push({
        text: intl.formatMessage(messages.lists),
        active: active.startsWith('list:'),
        icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
        items: lists.map((list) => ({
          to: '/list/$listId',
          params: { listId: list.id },
          text: list.title,
          icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
          active: active === `list:${list.id}`,
        })),
      });
    }
    if (circles?.length) {
      items.push({
        text: intl.formatMessage(messages.circles),
        active: active.startsWith('circle:'),
        icon: require('@phosphor-icons/core/regular/circles-three.svg'),
        items: circles.map((circle) => ({
          to: '/circles/$circleId',
          params: { circleId: circle.id },
          text: circle.title,
          icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
          active: active === `circle:${circle.id}`,
        })),
      });
    }
    if (antennas?.length) {
      items.push({
        text: intl.formatMessage(messages.antennas),
        active: active.startsWith('antenna:'),
        icon: require('@phosphor-icons/core/regular/broadcast.svg'),
        items: antennas.map((antenna) => ({
          to: '/antennas/$antennaId',
          params: { antennaId: antenna.id },
          text: antenna.title,
          icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
          active: active === `antenna:${antenna.id}`,
        })),
      });
    }
    if (pinnedHosts.length) {
      items.push({
        text: intl.formatMessage(messages.pinnedInstances),
        active: active.startsWith('instance:'),
        icon: require('@phosphor-icons/core/regular/globe-simple.svg'),
        items: pinnedHosts.map((instance) => ({
          to: '/timeline/$instance',
          params: { instance },
          text: instance,
          icon: require('@phosphor-icons/core/regular/globe-simple.svg'),
          active: active === `instance:${instance}`,
        })),
      });
    }
    return items;
  }, [active, lists, circles, antennas, features, isLoggedIn]);

  return (
    <DropdownMenu items={items} width='16rem' placement='bottom-start'>
      <div className='⁂-timeline-picker'>
        {heading}
        <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} aria-hidden />
      </div>
    </DropdownMenu>
  );
};

export { TimelinePicker };
