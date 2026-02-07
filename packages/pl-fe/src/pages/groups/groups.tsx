import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useGroups } from '@/api/hooks/groups/use-groups';
import GroupCard from '@/components/group-card';
import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import PlaceholderGroupCard from '@/features/placeholder/components/placeholder-group-card';
import { useModalsActions } from '@/stores/modals';

const Groups: React.FC = () => {
  const { openModal } = useModalsActions();

  const { groups, isLoading, hasNextPage, fetchNextPage } = useGroups();

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const createGroup = () => openModal('CREATE_GROUP');

  const renderBlankslate = () => (
    <Stack space={4} alignItems='center' justifyContent='center' className='py-6'>
      <Stack space={2} className='max-w-sm'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='groups.empty.title'
            defaultMessage='No groups yet'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='groups.empty.subtitle'
            defaultMessage='Start discovering groups to join or create your own.'
          />
        </Text>
      </Stack>

      <Button
        className='self-center'
        onClick={createGroup}
        theme='secondary'
      >
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </Button>
    </Stack>
  );

  return (
    <Stack space={4}>
      {!(!isLoading && groups.length === 0) && (
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
        isLoading={isLoading}
        showLoading={isLoading && groups.length === 0}
        placeholderComponent={PlaceholderGroupCard}
        placeholderCount={3}
        onLoadMore={handleLoadMore}
        hasMore={hasNextPage}
      >
        {groups.map((group) => (
          <Link key={group.id} to='/groups/$groupId' params={{ groupId: group.id }}>
            <GroupCard group={group} />
          </Link>
        ))}
      </ScrollableList>
    </Stack>
  );
};

export { Groups as default };
