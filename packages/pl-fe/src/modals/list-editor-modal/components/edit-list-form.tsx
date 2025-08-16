import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Toggle from 'pl-fe/components/ui/toggle';
import { SelectDropdown } from 'pl-fe/features/forms';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useList, useUpdateList } from 'pl-fe/queries/accounts/use-lists';

const messages = defineMessages({
  save: { id: 'lists.new.save', defaultMessage: 'Save list' },
  repliesPolicyNone: { id: 'lists.replies_policy.none', defaultMessage: 'No one' },
  repliesPolicyList: { id: 'lists.replies_policy.list', defaultMessage: 'Members of the list' },
  repliesPolicyFollowed: { id: 'lists.replies_policy.followed', defaultMessage: 'Any followed user' },
});

interface IListForm {
  listId: string;
  onTabChange: (tab: 'members') => void;
}

const ListForm: React.FC<IListForm> = ({
  listId,
  onTabChange,
}) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: list } = useList(listId);
  const { mutate: updateList, isPending: disabled } = useUpdateList(listId!);

  const [title, setTitle] = useState(list!.title);
  const [repliesPolicy, setRepliesPolicy] = useState(list!.replies_policy);
  const [exclusive, setExclusive] = useState(list!.exclusive);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTitle(e.target.value);
  };

  const handleSubmit: React.FormEventHandler<Element> = e => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    updateList({ title, replies_policy: repliesPolicy, exclusive });
  };

  const handleChangeRepliesPolicy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRepliesPolicy(e.target.value as 'none');
  };

  const handleChangeExclusive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExclusive(e.target.checked);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='lists.edit.title' defaultMessage='List title' />}
      >
        <Input
          outerClassName='grow'
          type='text'
          value={title}
          onChange={handleChange}
        />
      </FormGroup>

      <List>
        {features.listsRepliesPolicy && (
          <ListItem
            label={<FormattedMessage id='lists.edit.show_replies_to' defaultMessage='Include replies from list members to' />}
          >
            <SelectDropdown
              key={repliesPolicy}
              className='max-w-fit'
              items={{
                none: intl.formatMessage(messages.repliesPolicyNone),
                list: intl.formatMessage(messages.repliesPolicyList),
                followed: intl.formatMessage(messages.repliesPolicyFollowed),
              }}
              defaultValue={repliesPolicy || 'list'}
              onChange={handleChangeRepliesPolicy}
            />
          </ListItem>
        )}

        {features.listsExclusive && (
          <ListItem
            label={<FormattedMessage id='lists.exclusive' defaultMessage='Hide members in Home' />}
            hint={<FormattedMessage id='lists.exclusive_hint' defaultMessage='If someone is on this list, hide them in your Home feed to avoid seeing their posts twice.' />}
          >
            <Toggle
              checked={exclusive}
              onChange={handleChangeExclusive}
            />
          </ListItem>
        )}

        <ListItem
          label={<FormattedMessage id='lists.manage_members' defaultMessage='Manage list members' />}
          onClick={() => onTabChange('members')}
        />
      </List>

      <FormActions>
        <Button onClick={handleUpdate} disabled={disabled}>
          <FormattedMessage id='lists.edit.save' defaultMessage='Save list' />
        </Button>
      </FormActions>
    </Form>
  );
};

export { ListForm as default };
