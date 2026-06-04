import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Toggle from '@/components/ui/toggle';
import { useFeatures } from '@/hooks/use-features';
import { useList, useUpdateList } from '@/queries/accounts/use-lists';
import toast from '@/toast';

const messages = defineMessages({
  repliesPolicyNone: { id: 'lists.replies_policy.none', defaultMessage: 'No one' },
  repliesPolicyList: { id: 'lists.replies_policy.list', defaultMessage: 'Members of the list' },
  repliesPolicyFollowed: {
    id: 'lists.replies_policy.followed',
    defaultMessage: 'Any followed user',
  },
  success: { id: 'lists.edit.success', defaultMessage: 'List updated' },
  error: { id: 'lists.edit.error', defaultMessage: 'Failed to update list' },
});

interface IListForm {
  listId: string;
  onTabChange: (tab: 'members') => void;
}

const ListForm: React.FC<IListForm> = ({ listId, onTabChange }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: list } = useList(listId);
  const { mutate: updateList, isPending: disabled } = useUpdateList(listId);

  const [title, setTitle] = useState(list!.title);
  const [repliesPolicy, setRepliesPolicy] = useState(list!.replies_policy);
  const [exclusive, setExclusive] = useState(list!.exclusive);
  const [notify, setNotify] = useState(list!.notify);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    updateList(
      { title, replies_policy: repliesPolicy, exclusive, notify },
      {
        onSuccess: () => {
          toast.success(messages.success);
        },
        onError: () => {
          toast.error(intl.formatMessage(messages.error));
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} className='list-editor-modal__form'>
      <FormGroup labelText={<FormattedMessage id='lists.edit.title' defaultMessage='List title' />}>
        <Input
          type='text'
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </FormGroup>

      <List>
        {features.listsRepliesPolicy && (
          <ListItem
            label={
              <FormattedMessage
                id='lists.edit.show_replies_to'
                defaultMessage='Include replies from list members to'
              />
            }
          >
            <SelectDropdown
              key={repliesPolicy}
              items={{
                none: intl.formatMessage(messages.repliesPolicyNone),
                list: intl.formatMessage(messages.repliesPolicyList),
                followed: intl.formatMessage(messages.repliesPolicyFollowed),
              }}
              defaultValue={repliesPolicy ?? 'list'}
              onChange={(e) => {
                setRepliesPolicy(e.target.value as 'none');
              }}
            />
          </ListItem>
        )}

        {features.listsExclusive && (
          <ListItem
            label={<FormattedMessage id='lists.exclusive' defaultMessage='Hide members in Home' />}
            hint={
              <FormattedMessage
                id='lists.exclusive.hint'
                defaultMessage='If someone is on this list, hide them in your Home feed to avoid seeing their posts twice.'
              />
            }
          >
            <Toggle
              checked={exclusive}
              onChange={(e) => {
                setExclusive(e.target.checked);
              }}
            />
          </ListItem>
        )}

        {features.listsNotifications && (
          <ListItem
            label={<FormattedMessage id='lists.notifications' defaultMessage='Subscribe' />}
            hint={
              <FormattedMessage
                id='lists.notifications.hint'
                defaultMessage='Receive notifications for new posts in the list.'
              />
            }
          >
            <Toggle
              checked={notify}
              onChange={(e) => {
                setNotify(e.target.checked);
              }}
            />
          </ListItem>
        )}

        <ListItem
          label={
            <FormattedMessage id='lists.manage_members' defaultMessage='Manage list members' />
          }
          onClick={() => {
            onTabChange('members');
          }}
        />
      </List>

      <FormActions>
        <button type='button' onClick={handleUpdate} disabled={disabled}>
          <FormattedMessage id='lists.edit.save' defaultMessage='Save list' />
        </button>
      </FormActions>
    </Form>
  );
};

export { ListForm as default };
