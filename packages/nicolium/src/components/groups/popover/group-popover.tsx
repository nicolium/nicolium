import { Link, useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Divider from '@/components/ui/divider';
import Popover from '@/components/ui/popover';
import Text from '@/components/ui/text';
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
      referenceElementClassName='cursor-pointer'
      content={
        <div className='flex w-80 flex-col gap-4 pb-4'>
          <div
            className='relative flex h-60 flex-col rounded-lg bg-white black:bg-white dark:border-primary-800 dark:bg-primary-900'
            data-testid='group-card'
          >
            {/* Group Cover Image */}
            <div className='relative flex grow basis-1/2 flex-col rounded-t-lg bg-primary-100 dark:bg-gray-800'>
              {group.header && (
                <img
                  className='absolute inset-0 size-full rounded-t-lg object-cover'
                  src={group.header}
                  alt={group.header_description}
                />
              )}
            </div>

            {/* Group Avatar */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <GroupAvatar group={group} size={64} withRing />
            </div>

            {/* Group Info */}
            <div className='flex grow basis-1/2 flex-col items-center justify-end gap-0.5 py-4'>
              <Text size='lg' weight='bold'>
                <Emojify text={group.display_name} emojis={group.emojis} />
              </Text>

              <div className='flex flex-wrap gap-2 text-gray-700 dark:text-gray-600'>
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </div>
            </div>
          </div>

          <Divider />

          <div className='flex flex-col gap-0.5 px-4'>
            <Text weight='semibold'>
              <FormattedMessage id='group.popover.title' defaultMessage='Membership required' />
            </Text>
            <Text theme='muted'>
              <FormattedMessage
                id='group.popover.summary'
                defaultMessage='You must be a member of the group in order to reply to this post.'
              />
            </Text>
          </div>

          {!shouldHideAction && (
            <div className='px-4'>
              <Link to='/groups/$groupId' params={{ groupId: group.id }}>
                <Button type='button' theme='secondary' block>
                  <FormattedMessage id='group.popover.action' defaultMessage='View group' />
                </Button>
              </Link>
            </div>
          )}
        </div>
      }
      isFlush
    >
      <div className='inline-block'>{children}</div>
    </Popover>
  );
};

export { GroupPopover as default };
