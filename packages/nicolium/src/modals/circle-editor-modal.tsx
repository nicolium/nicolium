import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import {
  useAddAccountsToCircle,
  useCircle,
  useCircleAccounts,
  useRemoveAccountsFromCircle,
  useUpdateCircle,
} from '@/queries/accounts/use-circles';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import toast from '@/toast';

import Account from './list-editor-modal/components/account';
import Search from './list-editor-modal/components/search';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  success: { id: 'circles.edit.success', defaultMessage: 'Circle updated' },
  error: { id: 'circles.edit.error', defaultMessage: 'Failed to update circle' },
});

interface CircleEditorModalProps {
  circleId: string;
}

const CircleEditorModal: React.FC<BaseModalProps & CircleEditorModalProps> = ({
  circleId,
  onClose,
}) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const { data: circle } = useCircle(circleId);
  const { mutate: updateCircle, isPending: disabled } = useUpdateCircle(circleId);
  const { data: accountIds = [] as Array<string>, isFetching: isFetchingAccounts } =
    useCircleAccounts(circleId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, {
    following: true,
    limit: 5,
  });

  const [title, setTitle] = useState(circle?.title ?? '');

  const { mutate: addToCircle } = useAddAccountsToCircle(circleId);
  const { mutate: removeFromCircle } = useRemoveAccountsFromCircle(circleId);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    updateCircle(title, {
      onSuccess: () => {
        toast.success(messages.success);
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.error));
      },
    });
  };

  const onAdd = (accountId: string) => {
    addToCircle([accountId]);
  };
  const onRemove = (accountId: string) => {
    removeFromCircle([accountId]);
  };

  const onClickClose = () => {
    onClose('CIRCLE_EDITOR');
  };

  return (
    <Modal
      title={<FormattedMessage id='circles.edit' defaultMessage='Edit circle' />}
      onClose={onClickClose}
    >
      {circle ? (
        <div className='⁂-list-members-modal__form__container'>
          <Form onSubmit={handleSubmit}>
            <FormGroup
              labelText={<FormattedMessage id='circles.edit.title' defaultMessage='Circle title' />}
            >
              <Input
                outerClassName='grow'
                type='text'
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </FormGroup>

            <FormActions>
              <Button onClick={handleUpdate} disabled={disabled}>
                <FormattedMessage id='circles.edit.save' defaultMessage='Update title' />
              </Button>
            </FormActions>
          </Form>
          {accountIds.length > 0 ? (
            <div className='⁂-list-members-modal__form'>
              <CardHeader>
                <CardTitle
                  title={<FormattedMessage id='circles.members' defaultMessage='Circle members' />}
                />
              </CardHeader>
              <div className='⁂-list-members-modal__form__accounts'>
                {accountIds.map((accountId) => (
                  <Account
                    key={accountId}
                    accountId={accountId}
                    added={accountIds.includes(accountId)}
                    onAdd={onAdd}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          ) : isFetchingAccounts ? (
            <div className='⁂-list-members-modal__form__pending'>
              <Spinner />
            </div>
          ) : (
            <div className='⁂-list-members-modal__form__pending'>
              <Text theme='muted' size='sm' align='center'>
                <FormattedMessage
                  id='empty_column.circle_members'
                  defaultMessage='There are no members in this circle. Use search to find users to add.'
                />
              </Text>
            </div>
          )}

          <div>
            <CardHeader>
              <CardTitle
                title={
                  <FormattedMessage id='circles.add_to_circle' defaultMessage='Add to circle' />
                }
              />
            </CardHeader>
            <Search value={searchValue} onSubmit={setSearchValue} />
            <div className='⁂-list-members-modal__form__accounts'>
              {searchAccountIds.map((accountId) => (
                <Account
                  key={accountId}
                  accountId={accountId}
                  added={accountIds.includes(accountId)}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
};

export { CircleEditorModal as default, type CircleEditorModalProps };
