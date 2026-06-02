import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { shortNumberFormat } from '@/utils/numbers';

import type { Group } from 'pl-api';

interface IGroupMemberCount {
  group: Pick<Group, 'id' | 'members_count'>;
}

const GroupMemberCount = ({ group }: IGroupMemberCount) => (
  <Link to='/groups/$groupId/members' params={{ groupId: group.id }} className='group-member-count'>
    <span className='group-member-count__text' data-testid='group-member-count'>
      <span>{shortNumberFormat(group.members_count)}</span>
      <FormattedMessage
        id='groups.discover.search.results.member_count'
        defaultMessage='{members, plural, one {member} other {members}}'
        values={{
          members: group.members_count,
        }}
      />
    </span>
  </Link>
);

export { GroupMemberCount as default };
