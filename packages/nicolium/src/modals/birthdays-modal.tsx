import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import BirthdayAccount from '@/components/accounts/birthday-account';
import { getCurrentDate } from '@/components/panels/birthday-panel';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useBirthdayReminders } from '@/queries/accounts/use-birthday-reminders';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const BirthdaysModal = ({ onClose }: BaseModalProps) => {
  const [[day, month]] = useState(getCurrentDate);
  const { data: accountIds } = useBirthdayReminders(month, day);

  const onClickClose = () => {
    onClose('BIRTHDAYS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='birthdays_modal.empty'
        defaultMessage='None of your friends have birthday today.'
      />
    );

    body = (
      <ScrollableList
        emptyMessageText={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        useWindowScroll={false}
      >
        {accountIds.map((id) => (
          <BirthdayAccount key={id} accountId={id} />
        ))}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.birthdays' defaultMessage='Birthdays' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { BirthdaysModal as default };
