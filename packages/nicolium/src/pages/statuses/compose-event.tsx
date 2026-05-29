import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { cancelEventCompose } from '@/actions/events';
import Column from '@/components/ui/column';
import Tabs from '@/components/ui/tabs';
import { EditEvent } from '@/features/compose-event/tabs/edit-event';
import { ManagePendingParticipants } from '@/features/compose-event/tabs/manage-pending-participants';
import { eventEditRoute } from '@/router';

const messages = defineMessages({
  manageEvent: { id: 'navigation_bar.manage_event', defaultMessage: 'Manage event' },
  createEvent: { id: 'navigation_bar.create_event', defaultMessage: 'Create new event' },
  edit: { id: 'compose_event.tabs.edit', defaultMessage: 'Edit details' },
  pending: { id: 'compose_event.tabs.pending', defaultMessage: 'Manage requests' },
});

const EditEventPage = () => {
  const intl = useIntl();

  const { statusId } = eventEditRoute.useParams();

  const [tab, setTab] = useState<'edit' | 'pending'>('edit');

  useEffect(
    () => () => {
      cancelEventCompose();
    },
    [statusId],
  );

  const renderTabs = () => {
    const items = [
      {
        text: intl.formatMessage(messages.edit),
        action: () => {
          setTab('edit');
        },
        name: 'edit',
      },
      {
        text: intl.formatMessage(messages.pending),
        action: () => {
          setTab('pending');
        },
        name: 'pending',
      },
    ];

    return <Tabs items={items} activeItem={tab} />;
  };

  return (
    <Column label={intl.formatMessage(messages.manageEvent)}>
      <div className='manage-event-page__content'>
        {renderTabs()}
        {tab === 'edit' ? (
          <EditEvent statusId={statusId} />
        ) : (
          <ManagePendingParticipants statusId={statusId} />
        )}
      </div>
    </Column>
  );
};

const ComposeEventPage = () => {
  const intl = useIntl();

  useEffect(
    () => () => {
      cancelEventCompose();
    },
    [],
  );

  return (
    <Column label={intl.formatMessage(messages.createEvent)}>
      <EditEvent statusId={null} />
    </Column>
  );
};

export { ComposeEventPage as default, EditEventPage };
