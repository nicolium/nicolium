import iconImageSquare from '@phosphor-icons/core/regular/image-square.svg';
import { mediaAttachmentSchema } from 'pl-api';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import GroupAvatar from '@/components/groups/group-avatar';
import { ParsedContent } from '@/components/statuses/parsed-content';
import StillImage from '@/components/still-image';
import Icon from '@/components/ui/icon';
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
      <div className='⁂-group-header' data-testid='group-header-missing'>
        <div>
          <div className='⁂-group-header__banner ⁂-group-header__banner--placeholder' />
        </div>

        <div className='⁂-group-header__placeholder-body'>
          <div className='⁂-group-header__placeholder-row'>
            <div className='⁂-group-header__avatar-frame'>
              <div className='⁂-group-header__avatar-placeholder' />
            </div>
          </div>
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
          className='⁂-group-header__image'
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
            className='⁂-group-header__image-link'
          >
            {header}
          </a>
        );
      }
    }

    return (
      <div data-testid='group-header-image' className='⁂-group-header__image-container'>
        {isHeaderMissing ? (
          <Icon src={iconImageSquare} className='⁂-group-header__missing-icon' />
        ) : (
          header
        )}
      </div>
    );
  };

  return (
    <div className='⁂-group-header'>
      <div className='⁂-group-header__banner'>
        {renderHeader()}

        <div className='⁂-group-header__avatar' data-testid='group-avatar'>
          <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
            <GroupAvatar group={group} size={80} withRing />
          </a>
        </div>
      </div>

      <div className='⁂-group-header__body'>
        <h1 className='⁂-group-header__name' data-testid='group-name'>
          <Emojify text={group.display_name} emojis={group.emojis} />
        </h1>

        <div className='⁂-group-header__meta' data-testid='group-meta'>
          <div className='⁂-group-header__meta-row'>
            <GroupRelationship group={group} />
            <GroupPrivacy group={group} />
            <GroupMemberCount group={group} />
          </div>

          <p className='⁂-group-header__note'>
            <ParsedContent html={group.note} emojis={group.emojis} />
          </p>
        </div>

        <div className='⁂-group-header__actions' data-testid='group-actions'>
          <GroupOptionsButton group={group} />
          <GroupActionButton group={group} />
        </div>
      </div>
    </div>
  );
};

export { GroupHeader as default };
