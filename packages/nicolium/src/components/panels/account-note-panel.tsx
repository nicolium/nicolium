import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Textarea from '@/components/ui/textarea';
import Widget from '@/components/ui/widget';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useUpdateAccountNoteMutation } from '@/queries/accounts/use-relationship';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  placeholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
});

interface IAccountNotePanel {
  account: Pick<AccountEntity, 'id' | 'relationship'>;
}

const AccountNotePanel: React.FC<IAccountNotePanel> = ({ account }) => {
  const intl = useIntl();
  const me = useCurrentAccount();

  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(account.id);

  const debouncedUpdateAccountNote = useCallback(debounce(updateAccountNote, { wait: 900 }), []);

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string | undefined>(account.relationship?.note);
  const [saved, setSaved] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.target.value);

    debouncedUpdateAccountNote(e.target.value, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
        }, 2000);
      },
    });
  };

  useEffect(() => {
    setValue(account.relationship?.note);
  }, [account.relationship?.note]);

  if (!me || !account) {
    return null;
  }

  return (
    <Widget
      title={
        <div className='⁂-account-note-panel__header'>
          <label htmlFor={`account-note-${account.id}`}>
            <FormattedMessage id='account_note.header' defaultMessage='Note' />
          </label>
          {saved && (
            <span role='status' aria-live='polite' aria-atomic='true'>
              <FormattedMessage id='common.saved' defaultMessage='Saved' />
            </span>
          )}
        </div>
      }
    >
      <Textarea
        id={`account-note-${account.id}`}
        theme='transparent'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value ?? ''}
        onChange={handleChange}
        ref={textarea}
        autoGrow
      />
    </Widget>
  );
};

export { AccountNotePanel as default };
