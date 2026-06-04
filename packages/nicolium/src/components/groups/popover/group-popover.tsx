import { Link, useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Divider from '@/components/ui/divider';
import Popover from '@/components/ui/popover';
import Emojify from '@/features/emoji/emojify';
import { groupTimelineRoute } from '@/router';

import GroupAvatar from '../group-avatar';
import GroupMemberCount from '../group-member-count';
import GroupPrivacy from '../group-privacy';

import type { Group } from 'pl-api';

interface IGroupPopoverContainer {
  children: React.ReactElement;
  isEnabled: boolean;
  group: Group;
}

const GroupPopover: React.FC<IGroupPopoverContainer> = ({ children, group, isEnabled }) => {
  const shouldHideAction = !!useMatch({ from: groupTimelineRoute.fullPath, shouldThrow: false });

  if (!isEnabled) {
    return children;
  }

  return (
    <Popover
      interaction='click'
      content={
        <div className='group-popover__content'>
          <div className='group-card group-card--popover' data-testid='group-card'>
            {/* Group Cover Image */}
            <div className='group-card__cover'>
              {group.header && (
                <img
                  className='group-card__cover-image'
                  src={group.header}
                  alt={group.header_description}
                />
              )}
            </div>

            {/* Group Avatar */}
            <div className='group-card__avatar'>
              <GroupAvatar group={group} size={64} withRing />
            </div>

            {/* Group Info */}
            <div className='group-card__info'>
              <p className='group-card__name'>
                <Emojify text={group.display_name} emojis={group.emojis} />
              </p>

              <div className='group-card__meta'>
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </div>
            </div>
          </div>

          <Divider />

          <div className='group-popover__message'>
            <p className='group-popover__title'>
              <FormattedMessage id='group.popover.title' defaultMessage='Membership required' />
            </p>
            <p className='group-popover__summary'>
              <FormattedMessage
                id='group.popover.summary'
                defaultMessage='You must be a member of the group in order to reply to this post.'
              />
            </p>
          </div>

          {!shouldHideAction && (
            <div className='group-popover__action'>
              <Link to='/groups/$groupId' params={{ groupId: group.id }}>
                <button type='button'>
                  <FormattedMessage id='group.popover.action' defaultMessage='View group' />
                </button>
              </Link>
            </div>
          )}
        </div>
      }
      isFlush
    >
      <div className='group-popover__reference'>{children}</div>
    </Popover>
  );
};

export { GroupPopover as default };
