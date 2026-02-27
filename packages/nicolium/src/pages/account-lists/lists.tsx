import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import { useCreateList, useLists } from '@/queries/accounts/use-lists';

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

  return Object.values(lists)
    .filter((item): item is ListEntity => !!item)
    .toSorted((a, b) => a.title.localeCompare(b.title));
};

const NewListForm: React.FC = () => {
  const intl = useIntl();

  const [value, setValue] = useState('');

  const { mutate: createList, isPending } = useCreateList();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
            disabled={isPending}
            onChange={handleChange}
            placeholder={label}
          />
        </label>

        <Button disabled={isPending} onClick={handleSubmit} theme='primary'>
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

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.lists'
      defaultMessage="You don't have any lists yet. When you create one, it will show up here."
    />
  );

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
                to='/list/$listId'
                params={{ listId: list.id }}
                label={
                  <HStack alignItems='center' space={2}>
                    <Icon
                      src={require('@phosphor-icons/core/regular/list-bullets.svg')}
                      size={20}
                    />
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
