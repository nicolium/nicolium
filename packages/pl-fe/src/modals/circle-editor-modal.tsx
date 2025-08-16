import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAddAccountsToCircle, useCircle, useCircleAccounts, useRemoveAccountsFromCircle } from 'pl-fe/queries/accounts/use-circles';
import { useAccountSearch } from 'pl-fe/queries/search/use-search-accounts';

import Account from './list-editor-modal/components/account';
import Search from './list-editor-modal/components/search';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  addToCircle: { id: 'circles.add_to_circle', defaultMessage: 'Add to circle' },
  removeFromCircle: { id: 'circles.remove_from_circle', defaultMessage: 'Remove from circle' },
});

interface CircleEditorModalProps {
  circleId: string;
}

const CircleEditorModal: React.FC<BaseModalProps & CircleEditorModalProps> = ({ circleId, onClose }) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const { data: circle } = useCircle(circleId);
  const { data: accountIds = [] } = useCircleAccounts(circleId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, { following: true, limit: 5 });

  const { mutate: addToCircle } = useAddAccountsToCircle(circleId);
  const { mutate: removeFromCircle } = useRemoveAccountsFromCircle(circleId);

  const onAdd = (accountId: string) => addToCircle([accountId]);
  const onRemove = (accountId: string) => removeFromCircle([accountId]);

  const onClickClose = () => {
    onClose('CIRCLE_EDITOR');
  };

  return (
    <Modal
      title={<FormattedMessage id='circles.edit' defaultMessage='Edit circle' />}
      onClose={onClickClose}
    >
      {circle ? (
        <Stack space={2}>
          {accountIds.length > 0 ? (
            <div>
              <CardHeader>
                <CardTitle title={intl.formatMessage(messages.removeFromCircle)} />
              </CardHeader>
              <div className='max-h-48 overflow-y-auto'>
                {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added={accountIds.includes(accountId)} onAdd={onAdd} onRemove={onRemove} />)}
              </div>
            </div>
          ) : (
            <Text theme='muted' size='sm'>
              <FormattedMessage id='empty_column.circle_members' defaultMessage='There are no members in this circle. Use search to find users to add.' />
            </Text>
          )}

          <div>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.addToCircle)} />
            </CardHeader>
            <Search value={searchValue} onSubmit={setSearchValue} />
            <div className='max-h-48 overflow-y-auto'>
              {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} added={accountIds.includes(accountId)} onAdd={onAdd} onRemove={onRemove} />)}
            </div>
          </div>
        </Stack>
      ) : <Spinner />}
    </Modal>
  );
};

export { CircleEditorModal as default, type CircleEditorModalProps };
