import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card, { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { useTextField } from '@/hooks/forms/use-text-field';
import {
  useCreateRssFeedSubscription,
  useDeleteRssFeedSubscription,
  useRssFeedSubscriptions,
} from '@/queries/rss-feed-subscriptions/use-rss-feed-subscriptions';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.rss_feed_subscriptions', defaultMessage: 'Subscribed RSS feeds' },
  label: { id: 'rss_feed_subscriptions.new.title.placeholder', defaultMessage: 'RSS feed URL' },
  deleteFeed: { id: 'rss_feed_subscriptions.delete', defaultMessage: 'Delete feed' },
  createSuccess: {
    id: 'rss_feed_subscriptions.add.success',
    defaultMessage: 'Subscribed to RSS feed',
  },
  createFail: {
    id: 'rss_feed_subscriptions.add.fail',
    defaultMessage: 'Failed to subscribe to RSS feed',
  },
});

const NewFeedForm: React.FC = () => {
  const intl = useIntl();

  const url = useTextField();

  const { mutate: createRssFeedSubscription, isPending } = useCreateRssFeedSubscription();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    createRssFeedSubscription(url.value, {
      onSuccess() {
        toast.success(messages.createSuccess);
        url.onChange({ target: { value: '' } });
      },
      onError() {
        toast.error(messages.createFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <div className='flex items-center gap-2'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input type='text' placeholder={label} disabled={isPending} {...url} />
        </label>

        <Button disabled={isPending} type='submit' theme='primary'>
          <FormattedMessage
            id='rss_feed_subscriptions.new.create.title'
            defaultMessage='Subscribe'
          />
        </Button>
      </div>
    </Form>
  );
};

const RssFeedSubscriptions = () => {
  const intl = useIntl();

  const { data: feeds = [], isLoading } = useRssFeedSubscriptions();

  const { mutate: deleteRssFeedSubscription, isPending } = useDeleteRssFeedSubscription();

  const handleDelete = (url: string) => () => {
    deleteRssFeedSubscription(url);
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.rss_feed_subscriptions'
      defaultMessage="You haven't subscribed to any RSS feeds yet."
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='flex flex-col gap-4'>
        <CardTitle
          title={
            <FormattedMessage
              id='rss_feed_subscriptions.new.heading'
              defaultMessage='Subscribe to a new RSS feed'
            />
          }
        />
        <NewFeedForm />

        <CardTitle
          title={
            <FormattedMessage
              id='rss_feed_subscriptions.list.heading'
              defaultMessage='Subscribed feeds'
            />
          }
        />
        {feeds?.length ? (
          <List>
            {feeds?.map((feed) => (
              <ListItem
                key={feed.id}
                label={
                  <div className='flex w-full items-center gap-2'>
                    {feed.image_url ? (
                      <Avatar size={40} src={feed.image_url} />
                    ) : (
                      <div className='flex size-10 items-center justify-center rounded-full rounded-lg bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'>
                        <Icon src={iconRss} size={32} />
                      </div>
                    )}
                    <div className='flex flex-1 flex-col'>
                      <span>{feed.title}</span>
                      <Text size='sm' theme='muted' truncate>
                        {feed.url}
                      </Text>
                    </div>
                  </div>
                }
              >
                <IconButton
                  onClick={handleDelete(feed.url)}
                  disabled={isPending}
                  className='size-8 text-gray-700 dark:text-gray-600'
                  src={iconX}
                  title={intl.formatMessage(messages.deleteFeed)}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          !isLoading && (
            <Card variant='rounded' size='lg'>
              {emptyMessage}
            </Card>
          )
        )}
      </div>
    </Column>
  );
};

export { RssFeedSubscriptions as default };
