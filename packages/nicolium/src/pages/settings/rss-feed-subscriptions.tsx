import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Avatar from '@/components/ui/avatar';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
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
      <div className='rss-feed-subscriptions__form'>
        <label>
          <span style={{ display: 'none' }}>{label}</span>
          <Input type='text' placeholder={label} disabled={isPending} {...url} />
        </label>

        <button disabled={isPending} type='submit'>
          <FormattedMessage
            id='rss_feed_subscriptions.new.create.title'
            defaultMessage='Subscribe'
          />
        </button>
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
      <div className='rss-feed-subscriptions'>
        <h3 className='card-title'>
          <FormattedMessage
            id='rss_feed_subscriptions.new.heading'
            defaultMessage='Subscribe to a new RSS feed'
          />
        </h3>
        <NewFeedForm />

        <h3 className='card-title'>
          <FormattedMessage
            id='rss_feed_subscriptions.list.heading'
            defaultMessage='Subscribed feeds'
          />
        </h3>
        {feeds?.length ? (
          <List>
            {feeds?.map((feed) => (
              <ListItem
                key={feed.id}
                label={
                  <div className='rss-feed-subscriptions__item'>
                    {feed.image_url ? (
                      <Avatar size={40} src={feed.image_url} />
                    ) : (
                      <div className='rss-feed-subscriptions__item__avatar-fallback'>
                        <Icon src={iconRss} size={32} />
                      </div>
                    )}
                    <div className='rss-feed-subscriptions__item-info'>
                      <span>{feed.title}</span>
                      <span className='rss-feed-subscriptions__item-url'>{feed.url}</span>
                    </div>
                  </div>
                }
              >
                <IconButton
                  onClick={handleDelete(feed.url)}
                  disabled={isPending}
                  src={iconX}
                  title={intl.formatMessage(messages.deleteFeed)}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          !isLoading && <div className='settings-empty'>{emptyMessage}</div>
        )}
      </div>
    </Column>
  );
};

export { RssFeedSubscriptions as default };
