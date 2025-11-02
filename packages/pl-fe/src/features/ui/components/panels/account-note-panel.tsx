import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import Widget from 'pl-fe/components/ui/widget';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useUpdateAccountNoteMutation } from 'pl-fe/queries/accounts/use-relationship';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  placeholder: { id: 'account_note.placeholder', defaultMessage: 'Click to add a note' },
});

interface IAccountNotePanel {
  account: Pick<AccountEntity, 'id' | 'relationship'>;
}

const AccountNotePanel: React.FC<IAccountNotePanel> = ({ account }) => {
  const intl = useIntl();
  const me = useAppSelector((state) => state.me);

  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(account.id);

  const debouncedUpdateAccountNote = useCallback(debounce(updateAccountNote, { wait: 900 }), []);

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string | undefined>(account.relationship?.note);
  const [saved, setSaved] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setValue(e.target.value);

    debouncedUpdateAccountNote(e.target.value, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
      title={<HStack space={2} alignItems='center'>
        <label htmlFor={`account-note-${account.id}`}>
          <FormattedMessage id='account_note.header' defaultMessage='Note' />
        </label>
        {saved && (
          <Text theme='success' tag='span' className='leading-none'>
            <FormattedMessage id='generic.saved' defaultMessage='Saved' />
          </Text>
        )}
      </HStack>}
    >
      <Textarea
        id={`account-note-${account.id}`}
        theme='transparent'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value || ''}
        onChange={handleChange}
        ref={textarea}
        autoGrow
      />
    </Widget>
  );
};

export { AccountNotePanel as default };
