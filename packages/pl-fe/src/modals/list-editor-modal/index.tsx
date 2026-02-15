import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useList } from '@/queries/accounts/use-lists';

import EditListForm from './components/edit-list-form';
import ListMembersForm from './components/list-members-form';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ListEditorModalProps {
  listId: string;
}

const ListEditorModal: React.FC<BaseModalProps & ListEditorModalProps> = ({ listId, onClose }) => {
  const [tab, setTab] = useState<'info' | 'members'>('info');

  const { isFetched } = useList(listId);

  const onClickClose = () => {
    onClose('LIST_EDITOR');
  };

  return (
    <Modal
      title={tab === 'info' ? <FormattedMessage id='lists.edit' defaultMessage='Edit list' /> : <FormattedMessage id='lists.manage_members' defaultMessage='Manage list members' />}
      onClose={onClickClose}
      onBack={tab === 'members' ? () =>{
        setTab('info');
      } : undefined}
    >
      {isFetched ? (tab === 'info'
        ? <EditListForm listId={listId} onTabChange={setTab} />
        : <ListMembersForm listId={listId} />
      ) : <Spinner />}
    </Modal>
  );
};

export { ListEditorModal as default, type ListEditorModalProps };
