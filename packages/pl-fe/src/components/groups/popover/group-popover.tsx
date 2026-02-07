import { Link, useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Divider from '@/components/ui/divider';
import HStack from '@/components/ui/hstack';
import Popover from '@/components/ui/popover';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import GroupMemberCount from '@/features/group/components/group-member-count';
import GroupPrivacy from '@/features/group/components/group-privacy';
import { groupTimelineRoute } from '@/features/ui/router';

import GroupAvatar from '../group-avatar';

import type { Group } from 'pl-api';

interface IGroupPopoverContainer {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  isEnabled: boolean;
  group: Group;
}

const GroupPopover = (props: IGroupPopoverContainer) => {
  const { children, group, isEnabled } = props;

  const shouldHideAction = !!useMatch({ from: groupTimelineRoute.fullPath, shouldThrow: false });

  if (!isEnabled) {
    return children;
  }

  return (
    <Popover
      interaction='click'
      referenceElementClassName='cursor-pointer'
      content={
        <Stack space={4} className='w-80 pb-4'>
          <Stack
            className='relative h-60 rounded-lg bg-white black:bg-white dark:border-primary-800 dark:bg-primary-900'
            data-testid='group-card'
          >
            {/* Group Cover Image */}
            <Stack grow className='relative basis-1/2 rounded-t-lg bg-primary-100 dark:bg-gray-800'>
              {group.header && (
                <img
                  className='absolute inset-0 size-full rounded-t-lg object-cover'
                  src={group.header}
                  alt={group.header_description}
                />
              )}
            </Stack>

            {/* Group Avatar */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <GroupAvatar group={group} size={64} withRing />
            </div>

            {/* Group Info */}
            <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
              <Text size='lg' weight='bold'>
                <Emojify text={group.display_name} emojis={group.emojis} />
              </Text>

              <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </HStack>
            </Stack>
          </Stack>

          <Divider />

          <Stack space={0.5} className='px-4'>
            <Text weight='semibold'>
              <FormattedMessage id='group.popover.title' defaultMessage='Membership required' />
            </Text>
            <Text theme='muted'>
              <FormattedMessage id='group.popover.summary' defaultMessage='You must be a member of the group in order to reply to this status.' />
            </Text>
          </Stack>

          {!shouldHideAction && (
            <div className='px-4'>
              <Link to='/groups/$groupId' params={{ groupId: group.id }}>
                <Button type='button' theme='secondary' block>
                  <FormattedMessage id='group.popover.action' defaultMessage='View group' />
                </Button>
              </Link>
            </div>
          )}
        </Stack>
      }
      isFlush
    >
      <div className='inline-block'>{children}</div>
    </Popover>
  );
};

export { GroupPopover as default };
