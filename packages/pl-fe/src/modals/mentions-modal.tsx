import React, { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { fetchStatusWithContext } from '@/actions/statuses';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import AccountContainer from '@/containers/account-container';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

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
