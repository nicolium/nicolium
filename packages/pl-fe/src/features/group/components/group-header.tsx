import { mediaAttachmentSchema } from 'pl-api';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import GroupAvatar from '@/components/groups/group-avatar';
import { ParsedContent } from '@/components/parsed-content';
import StillImage from '@/components/still-image';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useModalsActions } from '@/stores/modals';

import GroupActionButton from './group-action-button';
import GroupMemberCount from './group-member-count';
import GroupOptionsButton from './group-options-button';
import GroupPrivacy from './group-privacy';
import GroupRelationship from './group-relationship';

import type { Group } from 'pl-api';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeader {
  group?: Group | false | null;
}

const GroupHeader: React.FC<IGroupHeader> = ({ group }) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const [isHeaderMissing, setIsHeaderMissing] = useState<boolean>(false);

  if (!group) {
    return (
      <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6' data-testid='group-header-missing'>
        <div>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='relative flex'>
              <div className='size-24 rounded-lg bg-gray-400 ring-4 ring-white dark:ring-gray-800' />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onAvatarClick = () => {
    const avatar = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: group.avatar,
    });
    openModal('MEDIA', { media: [avatar], index: 0 });
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: group.header,
    });
    openModal('MEDIA', { media: [header], index: 0 });
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const renderHeader = () => {
    let header: React.ReactNode;

    if (group.header) {
      header = (
        <StillImage
          src={group.header}
          alt={group.header_description || intl.formatMessage(messages.header)}
          className='relative h-32 w-full bg-gray-200 object-center black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-52'
          onError={() => {
            setIsHeaderMissing(true);
          }}
        />
      );

      if (!group.header_default) {
        header = (
          <a
            href={group.header}
            onClick={handleHeaderClick}
            target='_blank'
            className='relative w-full'
          >
            {header}
          </a>
        );
      }
    }

    return (
      <div
        data-testid='group-header-image'
        className='flex h-32 w-full items-center justify-center bg-gray-200 dark:bg-gray-800/30 md:rounded-t-xl lg:h-52'
      >
        {isHeaderMissing ? (
          <Icon
            src={require('@phosphor-icons/core/regular/image-square.svg')}
            className='size-6 text-gray-500 dark:text-gray-700'
          />
        ) : (
          header
        )}
      </div>
    );
  };

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      <div className='relative'>
        {renderHeader()}

        <div
          className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
          data-testid='group-avatar'
        >
          <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
            <GroupAvatar group={group} size={80} withRing />
          </a>
        </div>
      </div>

      <Stack alignItems='center' space={3} className='mx-auto mt-10 w-5/6 py-4'>
        <Text size='xl' weight='bold' data-testid='group-name'>
          <Emojify text={group.display_name} emojis={group.emojis} />
        </Text>

        <Stack data-testid='group-meta' space={1} alignItems='center'>
          <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
            <GroupRelationship group={group} />
            <GroupPrivacy group={group} />
            <GroupMemberCount group={group} />
          </HStack>

          <Text
            theme='muted'
            align='center'
            className='[&_a]:text-primary-600 [&_a]:hover:underline [&_a]:dark:text-primary-400'
          >
            <ParsedContent html={group.note} emojis={group.emojis} />
          </Text>
        </Stack>

        <HStack alignItems='center' space={2} data-testid='group-actions'>
          <GroupOptionsButton group={group} />
          <GroupActionButton group={group} />
        </HStack>
      </Stack>
    </div>
  );
};

export { GroupHeader as default };
