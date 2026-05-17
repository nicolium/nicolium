import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import BirthdayAccount from '@/components/accounts/birthday-account';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import ColumnLoading from '@/features/ui/components/column-loading';
import { getCurrentDate } from '@/hooks/use-current-date';
import { useBirthdayReminders } from '@/queries/accounts/use-birthday-reminders';

const messages = defineMessages({
  heading: { id: 'birthday_panel.title', defaultMessage: 'Birthdays' },
});

const BirthdaysPage = () => {
  const intl = useIntl();

  const [[day, month]] = useState(getCurrentDate);
  const { data: accountIds } = useBirthdayReminders(month, day);

  if (!accountIds) return <ColumnLoading />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        emptyMessageText={
          <FormattedMessage
            id='birthdays_modal.empty'
            defaultMessage='None of your friends have birthday today.'
          />
        }
        listClassName='max-w-full'
        itemClassName='pb-3'
      >
        {accountIds.map((id) => (
          <BirthdayAccount key={id} accountId={id} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { BirthdaysPage as default };
