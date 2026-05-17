import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Widget from '@/components/ui/widget';
import { useCurrentDate } from '@/hooks/use-current-date';
import { useBirthdayReminders } from '@/queries/accounts/use-birthday-reminders';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  all: { id: 'birthday_panel.all', defaultMessage: 'All' },
});

interface IBirthdayPanel {
  limit: number;
}

const BirthdayPanel = ({ limit }: IBirthdayPanel) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const [day, month] = useCurrentDate();

  const { data: birthdays = [] } = useBirthdayReminders(month, day);
  const birthdaysToRender = birthdays.slice(0, limit);

  if (!birthdaysToRender.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='birthday_panel.title' defaultMessage='Birthdays' />}
      onActionClick={
        birthdays.length !== birthdaysToRender.length ? () => openModal('BIRTHDAYS') : undefined
      }
      actionTitle={intl.formatMessage(messages.all)}
    >
      {birthdaysToRender.map((accountId) => (
        <AccountContainer key={accountId} id={accountId} withRelationship={false} />
      ))}
    </Widget>
  );
};

export { BirthdayPanel as default };
