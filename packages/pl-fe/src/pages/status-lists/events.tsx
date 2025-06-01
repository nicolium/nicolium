import React, { useCallback, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import EventPreview from 'pl-fe/components/event-preview';
import Button from 'pl-fe/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import PlaceholderEventPreview from 'pl-fe/features/placeholder/components/placeholder-event-preview';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useJoinedEvents, useRecentEvents } from 'pl-fe/queries/status-lists/use-events-lists';
import { makeGetStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Event = ({ id }: { id: string }) => {
  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id }));

  if (!status) return null;

  return (
    <Link
      className='w-full px-1'
      to={`/@${status.account.acct}/events/${status.id}`}
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
            onClick={() => handleChangeIndex(index - 1)}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon src={require('@tabler/icons/outline/chevron-left.svg')} className='size-6 text-black dark:text-white' />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map(statusId => <Event key={statusId} id={statusId} />)}
      </ReactSwipeableViews>
      {index !== statusIds.length - 1 && (
        <div className='absolute right-3 top-1/2 z-10 -mt-4'>
          <button
            onClick={() => handleChangeIndex(index + 1)}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon src={require('@tabler/icons/outline/chevron-right.svg')} className='size-6 text-black dark:text-white' />
          </button>
        </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const intl = useIntl();

  const { data: recentEvents = [], isLoading: recentEventsLoading } = useRecentEvents();
  const { data: joinedEvents = [], isLoading: joinedEventsLoading } = useJoinedEvents();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <HStack className='mb-2' space={2} justifyContent='between'>
        <CardTitle title={<FormattedMessage id='events.recent_events' defaultMessage='Recent events' />} />
        <Button className='ml-auto xl:hidden' theme='primary' size='sm' to='/events/new'>
          <FormattedMessage id='events.create_event' defaultMessage='Create event' />
        </Button>
      </HStack>
      <CardBody className='mb-2'>
        <EventCarousel
          statusIds={recentEvents}
          isLoading={recentEventsLoading}
          emptyMessage={<FormattedMessage id='events.recent_events.empty' defaultMessage='There are no public events yet.' />}
        />
      </CardBody>
      <CardHeader className='mb-2'>
        <CardTitle title={<FormattedMessage id='events.joined_events' defaultMessage='Joined events' />} />
      </CardHeader>
      <CardBody>
        <EventCarousel
          statusIds={joinedEvents}
          isLoading={joinedEventsLoading}
          emptyMessage={<FormattedMessage id='events.joined_events.empty' defaultMessage="You haven't joined any event yet." />}
        />
      </CardBody>
    </Column>
  );
};

export { EventsPage as default };
