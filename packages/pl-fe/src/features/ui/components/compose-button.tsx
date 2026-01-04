import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { groupComposeModal } from 'pl-fe/actions/compose';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useModalsActions } from 'pl-fe/stores/modals';

import { layouts } from '../router';

interface IComposeButton {
  /** Whether the button should shrink to fit in a smaller space. */
  shrink?: boolean;
}

const ComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const match = useMatch({ from: layouts.group.id, shouldThrow: false });
  const { group } = useGroup(match?.params.groupId || '');
  const isGroupMember = !!group?.relationship?.member;

  if (match && isGroupMember) {
    return <GroupComposeButton shrink={shrink} />;
  }

  return <HomeComposeButton shrink={shrink} />;
};

const HomeComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const { openModal } = useModalsActions();
  const onOpenCompose = () => openModal('COMPOSE');

  return (
    <button
      className='⁂-sidebar-navigation__compose-button'
      onClick={onOpenCompose}
    >
      {shrink
        ? <Icon src={require('@phosphor-icons/core/regular/plus.svg')} />
        : <FormattedMessage id='navigation.compose' defaultMessage='Compose' />}
    </button>
  );
};

const GroupComposeButton: React.FC<IComposeButton> = ({ shrink }) => {
  const dispatch = useAppDispatch();
  const match = useMatch({ from: layouts.group.id, shouldThrow: false });
  const { group } = useGroup(match?.params.groupId || '');

  if (!group) return null;

  const onOpenCompose = () => {
    dispatch(groupComposeModal(group));
  };

  return (
    <button
      className='⁂-sidebar-navigation__compose-button'
      onClick={onOpenCompose}
    >
      {shrink
        ? <Icon src={require('@phosphor-icons/core/regular/plus.svg')} />
        : <HStack space={3} alignItems='center'>
          <Avatar className='-my-1 border-2 border-white' size={30} src={group.avatar} alt={group.avatar_description} />
          <span>
            <FormattedMessage id='navigation.compose_group' defaultMessage='Compose to group' />
          </span>
        </HStack>}
    </button>
  );
};

export { ComposeButton as default };
