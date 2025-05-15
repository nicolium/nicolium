import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { changeListEditorTitle } from 'pl-fe/actions/lists';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Card from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useCreateList, useLists } from 'pl-fe/queries/accounts/use-lists';

import type { List as ListEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
  label: { id: 'lists.new.title_placeholder', defaultMessage: 'New list title' },
  title: { id: 'lists.new.create', defaultMessage: 'Add list' },
  create: { id: 'lists.new.create_title', defaultMessage: 'Add list' },
});

const getOrderedLists = (lists: Array<Pick<ListEntity, 'title'>>) => {
  if (!lists) {
    return lists;
  }

  return Object.values(lists).filter((item): item is ListEntity => !!item).sort((a, b) => a.title.localeCompare(b.title));
};

const NewListForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { title: value, isSubmitting: disabled } = useAppSelector((state) => state.listEditor);

  const { mutate: createList } = useCreateList();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    createList({ title: value });
  };

  const label = intl.formatMessage(messages.label);
  const create = intl.formatMessage(messages.create);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            value={value}
            disabled={disabled}
            onChange={handleChange}
            placeholder={label}
          />
        </label>

        <Button
          disabled={disabled}
          onClick={handleSubmit}
          theme='primary'
        >
          {create}
        </Button>
      </HStack>
    </Form>
  );
};

const ListsPage: React.FC = () => {
  const intl = useIntl();

  const { data: lists } = useLists(getOrderedLists);

  if (!lists) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.lists' defaultMessage="You don't have any lists yet. When you create one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewListForm />

        {!Object.keys(lists).length ? (
          <Card variant='rounded' size='lg'>
            {emptyMessage}
          </Card>
        ) : (
          <List>
            {lists.map((list: any) => (
              <ListItem
                key={list.id}
                to={`/list/${list.id}`}
                label={
                  <HStack alignItems='center' space={2}>
                    <Icon src={require('@tabler/icons/outline/list.svg')} size={20} />
                    <span>{list.title}</span>
                  </HStack>
                }
              />
            ))}
          </List>
        )}
      </Stack>
    </Column>
  );
};

export { ListsPage as default, NewListForm, getOrderedLists };
