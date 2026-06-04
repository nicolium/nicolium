import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Indicator from '@/components/ui/indicator';
import Input from '@/components/ui/input';
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
    <div key={relay.id} className='admin-relay'>
      <div className='admin-relay__content'>
        <div className='admin-relay__meta'>
          <p>
            <span>
              <FormattedMessage id='admin.relays.url' defaultMessage='Instance URL:' />
            </span>{' '}
            {relay.actor}
          </p>
          {relay.followed_back && (
            <span>
              <FormattedMessage id='admin.relays.followed_back' defaultMessage='Followed back' />
            </span>
          )}
          {relay.status && (
            <div className='admin-relay__status'>
              <Indicator
                state={
                  relay.status === 'accepted'
                    ? 'active'
                    : relay.status === 'rejected'
                      ? 'error'
                      : 'pending'
                }
              />
              <span>
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
              </span>
            </div>
          )}
        </div>
        <div className='admin-relay__actions'>
          <button onClick={handleDeleteRelay()}>
            <FormattedMessage id='admin.relays.unfollow' defaultMessage='Unfollow' />
          </button>
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
      <div className='admin-relays-page__form'>
        <label className='admin-relays-page__form__label'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input type='text' placeholder={label} disabled={isPendingFollow} {...name} />
        </label>

        <button disabled={isPendingFollow} type='submit'>
          <FormattedMessage id='admin.relays.new.follow' defaultMessage='Follow' />
        </button>
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
      <div className='admin-relays-page'>
        <NewRelayForm />

        {relays && (
          <ScrollableList
            scrollKey='relays'
            emptyMessageText={emptyMessage}
            itemClassName='admin-relay__container'
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
