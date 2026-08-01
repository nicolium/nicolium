import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import AccountList from '@/components/accounts/account-list';
import BirthdayAccount from '@/components/accounts/birthday-account';
import Modal from '@/components/ui/modal';
import { getCurrentDate } from '@/hooks/use-current-date';
import { useBirthdayReminders } from '@/queries/accounts/use-birthday-reminders';

import type { BaseModalProps } from '@/modals/modal-root';

const BirthdaysModal = ({ onClose }: BaseModalProps) => {
  const [[day, month]] = useState(getCurrentDate);
  const { data: accountIds } = useBirthdayReminders(month, day);

  return (
    <Modal
      title={<FormattedMessage id='column.birthdays' defaultMessage='Birthdays' />}
      onClose={() => onClose('BIRTHDAYS')}
    >
      <AccountList
        accountIds={accountIds}
        renderAccount={(accountId) => <BirthdayAccount key={accountId} accountId={accountId} />}
        emptyMessage={
          <FormattedMessage
            id='birthdays_modal.empty'
            defaultMessage='None of your friends have birthday today.'
          />
        }
      />
    </Modal>
  );
};

export { BirthdaysModal as default };
