import iconCaretLeft from '@phosphor-icons/core/regular/caret-left.svg';
import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import PlaceholderEventPreview from '@/components/placeholders/placeholder-event-preview';
import ReactSwipeableViews from '@/components/react-swipeable-views';
import EventPreview from '@/components/statuses/events/event-preview';
import Button from '@/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useJoinedEventsTimeline,
  useRecentEventsTimeline,
} from '@/queries/timelines/use-events-lists';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Event = ({ id }: { id: string }) => {
  const { data: status } = useStatus(id);

  if (!status) return null;

  return (
    <Link
      className='w-full px-1'
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
    <div className='relative -mx-1'>
      {index !== 0 && (
        <div className='absolute left-3 top-1/2 z-10 -mt-4'>
          <button
            onClick={() => {
              handleChangeIndex(index - 1);
            }}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon src={iconCaretLeft} className='size-6 text-black dark:text-white' />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map((statusId) => (
          <Event key={statusId} id={statusId} />
        ))}
      </ReactSwipeableViews>
      {index !== statusIds.length - 1 && (
        <div className='absolute right-3 top-1/2 z-10 -mt-4'>
          <button
            onClick={() => {
              handleChangeIndex(index + 1);
            }}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon src={iconCaretRight} className='size-6 text-black dark:text-white' />
          </button>
        </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const intl = useIntl();

  const { data: recentEvents = [], isLoading: recentEventsLoading } = useRecentEventsTimeline();
  const { data: joinedEvents = [], isLoading: joinedEventsLoading } = useJoinedEventsTimeline();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='mb-2 flex justify-between gap-2'>
        <CardTitle
          title={<FormattedMessage id='events.recent_events' defaultMessage='Recent events' />}
        />
        <Button className='ml-auto xl:hidden' theme='primary' size='sm' to='/events/new'>
          <FormattedMessage id='events.create_event' defaultMessage='Create event' />
        </Button>
      </div>
      <CardBody className='mb-2'>
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
      <CardHeader className='mb-2'>
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
              defaultMessage="You haven't joined any events yet."
            />
          }
        />
      </CardBody>
    </Column>
  );
};

export { EventsPage as default };
