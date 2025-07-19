import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeListEditorExclusive, changeListEditorRepliesPolicy, changeListEditorTitle } from 'pl-fe/actions/lists';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Toggle from 'pl-fe/components/ui/toggle';
import { SelectDropdown } from 'pl-fe/features/forms';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useUpdateList } from 'pl-fe/queries/accounts/use-lists';

const messages = defineMessages({
  save: { id: 'lists.new.save', defaultMessage: 'Save list' },
  repliesPolicyNone: { id: 'lists.replies_policy.none', defaultMessage: 'No one' },
  repliesPolicyList: { id: 'lists.replies_policy.list', defaultMessage: 'Members of the list' },
  repliesPolicyFollowed: { id: 'lists.replies_policy.followed', defaultMessage: 'Any followed user' },
});

interface IListForm {
  onTabChange: (tab: 'members') => void;
}

const ListForm: React.FC<IListForm> = ({
  onTabChange,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const { title: value, listId, repliesPolicy, exclusive } = useAppSelector((state) => state.listEditor);

  const { mutate: updateList, isPending: disabled } = useUpdateList(listId!);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit: React.FormEventHandler<Element> = e => {
    e.preventDefault();
    updateList({ title: value, replies_policy: repliesPolicy, exclusive });
  };

  const handleClick = () => {
    updateList({ title: value, replies_policy: repliesPolicy, exclusive });
  };

  const handleChangeRepliesPolicy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeListEditorRepliesPolicy(e.target.value as 'none'));
  };

  const handleChangeExclusive = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeListEditorExclusive(e.target.checked));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='lists.edit.title' defaultMessage='List title' />}
      >
        <Input
          outerClassName='grow'
          type='text'
          value={value}
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
        <Button onClick={handleClick} disabled={disabled}>
          <FormattedMessage id='lists.edit.save' defaultMessage='Save list' />
        </Button>
      </FormActions>
    </Form>
  );
};

export { ListForm as default };
