import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import { Link } from '@tanstack/react-router';
import { clsx } from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import GroupCard from '@/components/groups/group-card';
import PlaceholderGroupCard from '@/components/placeholders/placeholder-group-card';
import ScrollableList from '@/components/scrollable-list';
import Icon from '@/components/ui/icon';
import { useGroupsQuery } from '@/queries/groups/use-groups';
import { useModalsActions } from '@/stores/modals';
import { useSettingsStore } from '@/stores/settings';

const Groups: React.FC = () => {
  const { openModal } = useModalsActions();

  const widgetDisplayed = useSettingsStore((state) =>
    state.settings.sidebarItems.includes('context'),
  );

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

      <button className='groups-empty__button' onClick={createGroup}>
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
      </button>
    </div>
  );

  return (
    <div className='groups-page'>
      {!(!isFetching && groupIds.length === 0) && (
        <button
          className={clsx('groups-page__create-button', {
            'groups-page__create-button--optional': widgetDisplayed,
          })}
          onClick={createGroup}
        >
          <Icon src={iconUsersThree} aria-hidden />
          <FormattedMessage id='new_group_panel.action' defaultMessage='Create group' />
        </button>
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
