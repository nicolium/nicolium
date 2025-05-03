import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import Card from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useLists } from 'pl-fe/queries/accounts/use-lists';

import NewListForm from './components/new-list-form';

import type { List as ListEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
});

const getOrderedLists = (lists: Array<Pick<ListEntity, 'title'>>) => {
  if (!lists) {
    return lists;
  }

  return Object.values(lists).filter((item): item is ListEntity => !!item).sort((a, b) => a.title.localeCompare(b.title));
};

const Lists: React.FC = () => {
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

export { Lists as default, getOrderedLists };
