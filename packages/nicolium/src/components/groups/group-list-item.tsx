import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import GroupAvatar from '@/components/groups/group-avatar';
import Icon from '@/components/ui/icon';
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
    <div className='group-list-item' data-testid='group-list-item'>
      <Link
        key={group.id}
        to='/groups/$groupId'
        params={{ groupId: group.id }}
        className='group-list-item__link'
      >
        <div className='group-list-item__main'>
          <GroupAvatar group={group} size={44} />

          <div className='group-list-item__content'>
            <p className='group-list-item__name'>
              <Emojify text={group.display_name} emojis={group.emojis} />
            </p>

            <div className='group-list-item__meta'>
              <Icon src={group.locked ? iconLock : iconGlobe} />

              <p>
                {group.locked ? (
                  <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
                ) : (
                  <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
                )}
              </p>

              {typeof group.members_count !== 'undefined' && (
                <>
                  {' · '}
                  <p>
                    <span>{shortNumberFormat(group.members_count)}</span>
                    <FormattedMessage
                      id='groups.discover.search.results.member_count'
                      defaultMessage='{members, plural, one {member} other {members}}'
                      values={{
                        members: group.members_count,
                      }}
                    />
                  </p>
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
