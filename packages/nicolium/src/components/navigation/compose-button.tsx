import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';

import { layouts } from '../../features/ui/router';

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
  const onOpenCompose = () => {
    openModal('COMPOSE');
  };

  return (
    <button className='⁂-sidebar-navigation__compose-button' onClick={onOpenCompose}>
      {shrink ? (
        <Icon src={require('@phosphor-icons/core/regular/plus.svg')} />
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
    <button className='⁂-sidebar-navigation__compose-button' onClick={onOpenCompose}>
      {shrink ? (
        <Icon src={require('@phosphor-icons/core/regular/plus.svg')} />
      ) : (
        <div className='flex items-center gap-3'>
          <Avatar
            className='-my-1 border-2 border-white'
            size={30}
            src={group.avatar}
            alt={group.avatar_description}
          />
          <span>
            <FormattedMessage id='navigation.compose_group' defaultMessage='Compose to group' />
          </span>
        </div>
      )}
    </button>
  );
};

export { ComposeButton as default };
