import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import GroupCard from '@/components/groups/group-card';
import PlaceholderGroupCard from '@/components/placeholders/placeholder-group-card';
import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import { useGroupsQuery } from '@/queries/groups/use-groups';
import { useModalsActions } from '@/stores/modals';

const Groups: React.FC = () => {
  const { openModal } = useModalsActions();

  const { data: groupIds = [], isFetching, isLoading } = useGroupsQuery();

  const createGroup = () => {
    openModal('CREATE_GROUP');
  };

  const renderBlankslate = () => (
    <div className='groups-empty'>
      <div className='groups-empty__content'>
        <h2 className='groups-empty__title'>
          <FormattedMessage id='groups.empty.title' defaultMessage='No groups yet' />
        </h2>

        <p className='groups-empty__subtitle'>
          <FormattedMessage
            id='groups.empty.subtitle'
            defaultMessage='Start discovering groups to join or create your own.'
          />
        </p>
      </div>

      <Button className='groups-empty__button' onClick={createGroup} theme='secondary'>
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </Button>
    </div>
  );

  return (
    <div className='groups-page'>
      {!(!isFetching && groupIds.length === 0) && (
        <Button
          className='groups-page__create-button'
          icon={iconUsersThree}
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
        itemClassName='groups-page__item'
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
