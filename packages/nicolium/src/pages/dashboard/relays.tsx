import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Indicator from '@/components/ui/indicator';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { useTextField } from '@/hooks/forms/use-text-field';
import { useRelays } from '@/queries/admin/use-relays';
import toast from '@/toast';

import type { AdminRelay as RelayEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.relays', defaultMessage: 'Instance relays' },
  relayDeleteSuccess: { id: 'admin.relays.deleted', defaultMessage: 'Relay unfollowed' },
  label: { id: 'admin.relays.new.url.placeholder', defaultMessage: 'Instance relay URL' },
  createSuccess: { id: 'admin.relays.add.success', defaultMessage: 'Instance relay followed' },
  createFail: {
    id: 'admin.relays.add.fail',
    defaultMessage: 'Failed to follow the instance relay',
  },
});

interface IRelay {
  relay: RelayEntity;
}

const Relay: React.FC<IRelay> = ({ relay }) => {
  const { unfollowRelay } = useRelays();

  const handleDeleteRelay = () => () => {
    unfollowRelay(relay.id, {
      onSuccess: () => {
        toast.success(messages.relayDeleteSuccess);
      },
    });
  };

  return (
    <div key={relay.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap items-center gap-4'>
          <Text size='sm'>
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage id='admin.relays.url' defaultMessage='Instance URL:' />
            </Text>{' '}
            {relay.actor}
          </Text>
          {relay.followed_back && (
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage id='admin.relays.followed_back' defaultMessage='Followed back' />
            </Text>
          )}
          {relay.status && (
            <div className='flex items-center gap-2'>
              <Indicator
                state={
                  relay.status === 'accepted'
                    ? 'active'
                    : relay.status === 'rejected'
                      ? 'error'
                      : 'pending'
                }
              />
              <Text tag='span' size='sm' weight='medium'>
                {relay.status === 'accepted' ? (
                  <FormattedMessage id='admin.relays.status.accepted' defaultMessage='Accepted' />
                ) : relay.status === 'rejected' ? (
                  <FormattedMessage id='admin.relays.status.rejected' defaultMessage='Rejected' />
                ) : (
                  <FormattedMessage
                    id='admin.relays.status.requesting'
                    defaultMessage='Requesting'
                  />
                )}
              </Text>
            </div>
          )}
        </div>
        <div className='flex justify-end gap-2'>
          <Button theme='primary' onClick={handleDeleteRelay()}>
            <FormattedMessage id='admin.relays.unfollow' defaultMessage='Unfollow' />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NewRelayForm: React.FC = () => {
  const intl = useIntl();

  const name = useTextField();

  const { followRelay, isPendingFollow } = useRelays();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    followRelay(name.value, {
      onSuccess() {
        toast.success(messages.createSuccess);
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

          <Input type='text' placeholder={label} disabled={isPendingFollow} {...name} />
        </label>

        <Button disabled={isPendingFollow} type='submit' theme='primary'>
          <FormattedMessage id='admin.relays.new.follow' defaultMessage='Follow' />
        </Button>
      </div>
    </Form>
  );
};

const RelaysPage: React.FC = () => {
  const intl = useIntl();

  const { data: relays, isFetching } = useRelays();

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.admin.relays'
      defaultMessage='There are no relays followed yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='flex flex-col gap-4'>
        <NewRelayForm />

        {relays && (
          <ScrollableList
            scrollKey='relays'
            emptyMessageText={emptyMessage}
            itemClassName='py-3 first:pt-0 last:pb-0'
            isLoading={isFetching}
            showLoading={isFetching && !relays?.length}
          >
            {relays.map((relay) => (
              <Relay key={relay.id} relay={relay} />
            ))}
          </ScrollableList>
        )}
      </div>
    </Column>
  );
};

export { RelaysPage as default };
