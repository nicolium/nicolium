import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import GroupCard from '@/components/groups/group-card';
import PlaceholderGroupCard from '@/components/placeholders/placeholder-group-card';
import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { useGroupsQuery } from '@/queries/groups/use-groups';
import { useModalsActions } from '@/stores/modals';

const Groups: React.FC = () => {
  const { openModal } = useModalsActions();

  const { data: groupIds = [], isFetching, isLoading } = useGroupsQuery();

  const createGroup = () => {
    openModal('CREATE_GROUP');
  };

  const renderBlankslate = () => (
    <div className='flex flex-col items-center justify-center gap-4 py-6'>
      <div className='flex max-w-sm flex-col gap-2'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage id='groups.empty.title' defaultMessage='No groups yet' />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='groups.empty.subtitle'
            defaultMessage='Start discovering groups to join or create your own.'
          />
        </Text>
      </div>

      <Button className='self-center' onClick={createGroup} theme='secondary'>
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </Button>
    </div>
  );

  return (
    <div className='flex flex-col gap-4'>
      {!(!isFetching && groupIds.length === 0) && (
        <Button
          className='xl:hidden'
          icon={require('@phosphor-icons/core/regular/users-three.svg')}
          onClick={createGroup}
          theme='secondary'
          block
        >
          <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
        </Button>
      )}

      <ScrollableList
        scrollKey='groups'
        emptyMessageText={renderBlankslate()}
        itemClassName='pb-4 last:pb-0'
        isLoading={isFetching}
        showLoading={isLoading}
        placeholderComponent={PlaceholderGroupCard}
        placeholderCount={3}
      >
        {groupIds.map((groupId) => (
          <Link key={groupId} to='/groups/$groupId' params={{ groupId }}>
            <GroupCard groupId={groupId} />
          </Link>
        ))}
      </ScrollableList>
    </div>
  );
};

export { Groups as default };
