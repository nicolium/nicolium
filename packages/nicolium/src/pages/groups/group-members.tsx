import clsx from 'clsx';
import { GroupRoles } from 'pl-api';
import React, { useMemo } from 'react';

import { PendingItemsRow } from '@/components/pending-items-row';
import ScrollableList from '@/components/scrollable-list';
import GroupMemberListItem from '@/features/group/components/group-member-list-item';
import PlaceholderAccount from '@/features/placeholder/components/placeholder-account';
import { groupMembersRoute } from '@/features/ui/router';
import { useGroupQuery } from '@/queries/groups/use-group';
import {
  useGroupMembers,
  useGroupMembershipRequestsQuery,
} from '@/queries/groups/use-group-members';

const GroupMembers: React.FC = () => {
  const { groupId } = groupMembersRoute.useParams();

  const { data: group, isFetching: isFetchingGroup } = useGroupQuery(groupId, true);
  const { data: owners, isFetching: isFetchingOwners } = useGroupMembers(groupId, GroupRoles.OWNER);
  const { data: admins, isFetching: isFetchingAdmins } = useGroupMembers(groupId, GroupRoles.ADMIN);
  const {
    data: users,
    isFetching: isFetchingUsers,
    fetchNextPage,
    hasNextPage,
  } = useGroupMembers(groupId, GroupRoles.USER);
  const { isFetching: isFetchingPending, data: membershipRequests = [] } =
    useGroupMembershipRequestsQuery(groupId);

  const isLoading =
    isFetchingGroup || isFetchingOwners || isFetchingAdmins || isFetchingUsers || isFetchingPending;

  const members = useMemo(
    () => [...(owners ?? []), ...(admins ?? []), ...(users ?? [])],
    [owners, admins, users],
  );

  return (
    <ScrollableList
      scrollKey={`groupMembers:${groupId}`}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      isLoading={!group || isLoading}
      showLoading={!group || ((isFetchingPending ?? isLoading) && members.length === 0)}
      placeholderComponent={PlaceholderAccount}
      placeholderCount={3}
      className='⁂-status-list'
      itemClassName='py-3 last:pb-0'
      prepend={
        membershipRequests.length > 0 && (
          <div
            className={clsx('py-3', {
              'border-b border-gray-200 dark:border-gray-800': members.length,
            })}
          >
            <PendingItemsRow
              to='/groups/$groupId/manage/requests'
              params={{ groupId }}
              count={membershipRequests.length}
            />
          </div>
        )
      }
    >
      {members.map((member) => (
        <GroupMemberListItem group={group!} member={member} key={member.account_id} />
      ))}
    </ScrollableList>
  );
};

export { GroupMembers as default };
