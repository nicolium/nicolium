import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card, { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Stack from '@/components/ui/stack';
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
  label: { id: 'rss_feed_subscriptions.new.title_placeholder', defaultMessage: 'RSS feed URL' },
  deleteFeed: { id: 'rss_feed_subscriptions.delete', defaultMessage: 'Delete feed' },
  createSuccess: {
    id: 'rss_feed_subscriptions.add.success',
    defaultMessage: 'Successfully subscribed to RSS feed',
  },
  createFail: {
    id: 'rss_feed_subscriptions.add.fail',
    defaultMessage: 'Failed to subsrcibe to RSS feed',
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
      },
      onError() {
        toast.success(messages.createFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input type='text' placeholder={label} disabled={isPending} {...url} />
        </label>

        <Button disabled={isPending} type='submit' theme='primary'>
          <FormattedMessage
            id='rss_feed_subscriptions.new.create_title'
            defaultMessage='Subscribe'
          />
        </Button>
      </HStack>
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
      <Stack space={4}>
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
                  <HStack className='w-full' alignItems='center' space={2}>
                    {feed.image_url ? (
                      <Avatar size={40} src={feed.image_url} />
                    ) : (
                      <Icon src={require('@phosphor-icons/core/regular/rss.svg')} size={40} />
                    )}
                    <Stack className='flex-1'>
                      <span>{feed.title}</span>
                      <Text size='sm' theme='muted' truncate>
                        {feed.url}
                      </Text>
                    </Stack>
                    <IconButton
                      onClick={handleDelete(feed.url)}
                      disabled={isPending}
                      className='size-8 text-gray-700 dark:text-gray-600'
                      src={require('@phosphor-icons/core/regular/x.svg')}
                      title={intl.formatMessage(messages.deleteFeed)}
                    />
                  </HStack>
                }
              />
            ))}
          </List>
        ) : (
          !isLoading && (
            <Card variant='rounded' size='lg'>
              {emptyMessage}
            </Card>
          )
        )}
      </Stack>
    </Column>
  );
};

export { RssFeedSubscriptions as default };
