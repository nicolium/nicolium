import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setupListEditor, resetListEditor } from 'pl-fe/actions/lists';
import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Modal from 'pl-fe/components/ui/modal';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import Account from './components/account';
import EditListForm from './components/edit-list-form';
import Search from './components/search';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
});

interface ListEditorModalProps {
  listId: string;
}

const ListEditorModal: React.FC<BaseModalProps & ListEditorModalProps> = ({ listId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<'info' | 'members'>('info');

  const accountIds = useAppSelector((state) => state.listEditor.accounts.items);
  const searchAccountIds = useAppSelector((state) => state.listEditor.suggestions.items);

  useEffect(() => {
    dispatch(setupListEditor(listId));

    return () => {
      dispatch(resetListEditor());
    };
  }, []);

  const onClickClose = () => {
    onClose('LIST_EDITOR');
  };

  return (
    <Modal
      title={tab === 'info' ? <FormattedMessage id='lists.edit' defaultMessage='Edit list' /> : <FormattedMessage id='lists.manage_members' defaultMessage='Manage list memebrs' />}
      onClose={onClickClose}
      onBack={tab === 'members' ? () => setTab('info') : undefined}
    >
      {tab === 'info'
        ? <EditListForm onTabChange={setTab} />
        : (
          <>
            {accountIds.length > 0 && (
              <>
                <div>
                  <CardHeader>
                    <CardTitle title={intl.formatMessage(messages.removeFromList)} />
                  </CardHeader>
                  <div className='max-h-48 overflow-y-auto'>
                    {accountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
                  </div>
                </div>
                <br />
              </>
            )}

            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.addToList)} />
            </CardHeader>
            <Search />
            <div className='max-h-48 overflow-y-auto'>
              {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
            </div>
          </>
        )}
    </Modal>
  );
};

export { ListEditorModal as default, type ListEditorModalProps };
