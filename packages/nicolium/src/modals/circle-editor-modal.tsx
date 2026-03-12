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
  success: { id: 'circles.edit.success', defaultMessage: 'Circle updated successfully' },
  error: { id: 'circles.edit.error', defaultMessage: 'Error updating circle' },
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
        toast.success(intl.formatMessage(messages.success));
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
        <div className='flex flex-col gap-2'>
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
            <div className='min-h-24'>
              <CardHeader>
                <CardTitle
                  title={
                    <FormattedMessage
                      id='circles.remove_from_circle'
                      defaultMessage='Remove from circle'
                    />
                  }
                />
              </CardHeader>
              <div className='max-h-48 overflow-y-auto'>
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
            <div className='flex min-h-24 items-center justify-center'>
              <Spinner />
            </div>
          ) : (
            <div className='flex min-h-24 items-center justify-center'>
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
            <div className='max-h-48 overflow-y-auto'>
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
