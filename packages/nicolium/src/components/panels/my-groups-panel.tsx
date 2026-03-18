import React from 'react';
import { FormattedMessage } from 'react-intl';

import PlaceholderGroupSearch from '@/components/placeholders/placeholder-group-search';
import Widget from '@/components/ui/widget';
import GroupListItem from '@/features/groups/components/discover/group-list-item';
import { useGroupsQuery } from '@/queries/groups/use-groups';

const MyGroupsPanel = () => {
  const { data: groupIds = [], isFetching, isError } = useGroupsQuery();
  const isEmpty = (!isFetching && groupIds.length === 0) ?? isError;

  if (isEmpty) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='my_groups_panel.title' defaultMessage='My groups' />}>
      {isFetching
        ? new Array(3)
            .fill(0)
            .map((_, idx) => <PlaceholderGroupSearch key={idx} withJoinAction={false} />)
        : groupIds
            .slice(0, 3)
            .map((groupId) => (
              <GroupListItem groupId={groupId} withJoinAction={false} key={groupId} />
            ))}
    </Widget>
  );
};

export { MyGroupsPanel as default };
