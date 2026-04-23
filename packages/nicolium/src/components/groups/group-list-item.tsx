import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import GroupAvatar from '@/components/groups/group-avatar';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useGroupQuery } from '@/queries/groups/use-group';
import { shortNumberFormat } from '@/utils/numbers';

import GroupActionButton from './group-action-button';

interface IGroupListItem {
  groupId: string;
  withJoinAction?: boolean;
}

const GroupListItem: React.FC<IGroupListItem> = ({ groupId, withJoinAction = true }) => {
  const { data: group } = useGroupQuery(groupId, true);

  if (!group) return null;

  return (
    <div className='flex items-center justify-between' data-testid='group-list-item'>
      <Link
        key={group.id}
        to='/groups/$groupId'
        params={{ groupId: group.id }}
        className='overflow-hidden'
      >
        <div className='flex items-center gap-2'>
          <GroupAvatar group={group} size={44} />

          <div className='flex flex-col overflow-hidden'>
            <Text weight='bold' truncate>
              <Emojify text={group.display_name} emojis={group.emojis} />
            </Text>

            <div className='flex items-center gap-1 text-gray-700 dark:text-gray-600'>
              <Icon className='size-4.5' src={group.locked ? iconLock : iconGlobe} />

              <Text theme='inherit' tag='span' size='sm' weight='medium'>
                {group.locked ? (
                  <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
                ) : (
                  <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
                )}
              </Text>

              {typeof group.members_count !== 'undefined' && (
                <>
                  <span>&bull;</span>
                  <Text theme='inherit' tag='span' size='sm' weight='medium'>
                    {shortNumberFormat(group.members_count)}{' '}
                    <FormattedMessage
                      id='groups.discover.search.results.member_count'
                      defaultMessage='{members, plural, one {member} other {members}}'
                      values={{
                        members: group.members_count,
                      }}
                    />
                  </Text>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      {withJoinAction && <GroupActionButton group={group} />}
    </div>
  );
};

export { GroupListItem as default };
