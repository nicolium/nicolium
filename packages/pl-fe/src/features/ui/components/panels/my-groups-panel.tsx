import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useGroups } from '@/api/hooks/groups/use-groups';
import Widget from '@/components/ui/widget';
import GroupListItem from '@/features/groups/components/discover/group-list-item';
import PlaceholderGroupSearch from '@/features/placeholder/components/placeholder-group-search';

const MyGroupsPanel = () => {
  const { groups, isFetching, isFetched, isError } = useGroups();
  const isEmpty = (isFetched && groups.length === 0) ?? isError;

  if (isEmpty) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='my_groups_panel.title' defaultMessage='My groups' />}>
      {isFetching
        ? new Array(3)
            .fill(0)
            .map((_, idx) => <PlaceholderGroupSearch key={idx} withJoinAction={false} />)
        : groups
            .slice(0, 3)
            .map((group) => <GroupListItem group={group} withJoinAction={false} key={group.id} />)}
    </Widget>
  );
};

export { MyGroupsPanel as default };
