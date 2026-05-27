import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useGroupQuery } from '@/queries/groups/use-group';
import { openDedicatedComposeWindow, useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

import { layouts } from '../../router';

interface IComposeButton {
  /** Whether the button should shrink to fit in a smaller space. */
  shrink?: boolean;
}

const ComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const match = useMatch({ from: layouts.group.id, shouldThrow: false });
  const { data: group } = useGroupQuery(match?.params.groupId);
  const isGroupMember = !!group?.relationship?.member;

  if (match && isGroupMember) {
    return <GroupComposeButton shrink={shrink} />;
  }

  return <HomeComposeButton shrink={shrink} />;
};

const HomeComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const { openModal } = useModalsActions();
  const { useDedicatedComposePage } = useSettings();

  const onOpenCompose = () => {
    if (useDedicatedComposePage && !userTouching.matches) {
      openDedicatedComposeWindow();
      return;
    }

    openModal('COMPOSE', undefined, document.getElementById('sidebar-compose') || undefined);
  };

  return (
    <button
      className='sidebar-navigation__compose-button'
      id='sidebar-compose'
      onClick={onOpenCompose}
    >
      {shrink ? (
        <Icon src={iconNotePencil} />
      ) : (
        <FormattedMessage id='navigation.compose' defaultMessage='Compose' />
      )}
    </button>
  );
};

const GroupComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const { groupComposeModal } = useComposeActions();
  const match = useMatch({ from: layouts.group.id, shouldThrow: false });
  const { data: group } = useGroupQuery(match?.params.groupId);

  if (!group) return null;

  const onOpenCompose = () => {
    groupComposeModal(group);
  };

  return (
    <button className='sidebar-navigation__compose-button' onClick={onOpenCompose}>
      {shrink ? (
        <Icon src={iconNotePencil} />
      ) : (
        <div className='sidebar-navigation__compose-button__group'>
          <Avatar size={30} src={group.avatar} alt={group.avatar_description} />
          <span>
            <FormattedMessage id='navigation.compose_group' defaultMessage='Compose to group' />
          </span>
        </div>
      )}
    </button>
  );
};

export { ComposeButton as default };
