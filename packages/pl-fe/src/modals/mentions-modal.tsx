import React, { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { fetchStatusWithContext } from 'pl-fe/actions/statuses';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatus } from 'pl-fe/selectors';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

interface MentionsModalProps {
  statusId: string;
}

const MentionsModal: React.FC<BaseModalProps & MentionsModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) => getStatus(state, { id: statusId }));
  const accountIds = status ? status.mentions.map(m => m.id) : null;

  const fetchData = () => {
    dispatch(fetchStatusWithContext(statusId, intl));
  };

  const onClickClose = () => {
    onClose('MENTIONS');
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={onClickClose}
    >
      <ScrollableList
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        isLoading={!accountIds}
        useWindowScroll={false}
      >
        {(accountIds || []).map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    </Modal>
  );
};

export { MentionsModal as default, type MentionsModalProps };
