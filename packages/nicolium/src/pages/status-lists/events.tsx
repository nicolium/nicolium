import iconCaretLeft from '@phosphor-icons/core/regular/caret-left.svg';
import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import PlaceholderEventPreview from '@/components/placeholders/placeholder-event-preview';
import ReactSwipeableViews from '@/components/react-swipeable-views';
import EventPreview from '@/components/statuses/events/event-preview';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useJoinedEventsTimeline,
  useRecentEventsTimeline,
} from '@/queries/timelines/use-events-lists';
import { useSettingsStore } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Event = ({ id }: { id: string }) => {
  const { data: status } = useStatus(id);

  if (!status) return null;

  return (
    <Link
      className='events-page__event'
      to='/@{$username}/events/$statusId'
      params={{ username: status.account.acct, statusId: status.id }}
    >
      <EventPreview status={status} floatingAction={false} />
    </Link>
  );
};

interface IEventCarousel {
  statusIds: Array<string>;
  isLoading?: boolean | null;
  emptyMessage: React.ReactNode;
}

const EventCarousel: React.FC<IEventCarousel> = ({ statusIds, isLoading, emptyMessage }) => {
  const [index, setIndex] = useState(0);

  const handleChangeIndex = (index: number) => {
    setIndex(index % statusIds.length);
  };

  if (statusIds.length === 0) {
    if (isLoading) {
      return <PlaceholderEventPreview />;
    }

    return (
      <Card variant='rounded' size='lg'>
        {emptyMessage}
      </Card>
    );
  }

  return (
    <div className='event-carousel'>
      {index !== 0 && (
        <div className='event-carousel__button event-carousel__button--left'>
          <button
            onClick={() => {
              handleChangeIndex(index - 1);
            }}
          >
            <Icon src={iconCaretLeft} />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map((statusId) => (
          <Event key={statusId} id={statusId} />
        ))}
      </ReactSwipeableViews>
      {index !== statusIds.length - 1 && (
        <div className='event-carousel__button event-carousel__button--right'>
          <button
            onClick={() => {
              handleChangeIndex(index + 1);
            }}
          >
            <Icon src={iconCaretRight} />
          </button>
        </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const intl = useIntl();

  const widgetDisplayed = useSettingsStore((state) =>
    state.settings.sidebarItems.includes('context'),
  );

  const { data: recentEvents = [], isLoading: recentEventsLoading } = useRecentEventsTimeline();
  const { data: joinedEvents = [], isLoading: joinedEventsLoading } = useJoinedEventsTimeline();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='events-page__title-row'>
        <CardTitle
          title={<FormattedMessage id='events.recent_events' defaultMessage='Recent events' />}
        />
        <Link
          // conditionally hide the create event button (on lower breakpoints) if the context widget is displayed
          className={clsx('events-page__create-button', {
            'events-page__create-button--optional': widgetDisplayed,
          })}
          to='/events/new'
        >
          <FormattedMessage id='events.create_event' defaultMessage='Create event' />
        </Link>
      </div>
      <CardBody className='events-page__section'>
        <EventCarousel
          statusIds={recentEvents}
          isLoading={recentEventsLoading}
          emptyMessage={
            <FormattedMessage
              id='events.recent_events.empty'
              defaultMessage='There are no public events yet.'
            />
          }
        />
      </CardBody>
      <CardHeader className='events-page__section'>
        <CardTitle
          title={<FormattedMessage id='events.joined_events' defaultMessage='Joined events' />}
        />
      </CardHeader>
      <CardBody>
        <EventCarousel
          statusIds={joinedEvents}
          isLoading={joinedEventsLoading}
          emptyMessage={
            <FormattedMessage
              id='events.joined_events.empty'
              defaultMessage='You haven’t joined any events yet.'
            />
          }
        />
      </CardBody>
    </Column>
  );
};

export { EventsPage as default };
