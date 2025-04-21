import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeListEditorTitle } from 'pl-fe/actions/lists';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useUpdateList } from 'pl-fe/queries/accounts/use-lists';

const messages = defineMessages({
  title: { id: 'lists.edit.submit', defaultMessage: 'Change title' },
  save: { id: 'lists.new.save_title', defaultMessage: 'Save title' },
});

const ListForm = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { title: value, listId } = useAppSelector((state) => state.listEditor);

  const { mutate: updateList, isPending: disabled } = useUpdateList(listId!);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit: React.FormEventHandler<Element> = e => {
    e.preventDefault();
    updateList({ title: value });
  };

  const handleClick = () => {
    updateList({ title: value });
  };

  const save = intl.formatMessage(messages.save);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <Input
          outerClassName='grow'
          type='text'
          value={value}
          onChange={handleChange}
        />

        <Button onClick={handleClick} disabled={disabled}>
          {save}
        </Button>
      </HStack>
    </Form>
  );
};

export { ListForm as default };
