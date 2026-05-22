import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import { GroupRoles, type Group } from 'pl-api';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import IconButton from '@/components/ui/icon-button';
import { useLeaveGroupMutation } from '@/queries/groups/use-group-relationship';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: {
    id: 'confirmations.leave_group.message',
    defaultMessage: 'You are about to leave the group. Do you want to continue?',
  },
  leave: { id: 'group.leave.label', defaultMessage: 'Leave' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
  share: { id: 'group.share.label', defaultMessage: 'Share' },
  groupOptions: { id: 'group.options', defaultMessage: 'Group options' },
});

interface IGroupActionButton {
  group: Pick<Group, 'id' | 'display_name' | 'url' | 'relationship'>;
}

const GroupOptionsButton = ({ group }: IGroupActionButton) => {
  const { openModal } = useModalsActions();
  const intl = useIntl();

  const { mutate: leaveGroup } = useLeaveGroupMutation(group.id);

  const isMember = group.relationship?.role === GroupRoles.USER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;
  const isInGroup = !!group.relationship?.member;

  const handleShare = () => {
    navigator
      .share({
        text: group.display_name,
        url: group.url,
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      });
  };

  const handleLeave = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () =>
        leaveGroup(undefined, {
          onSuccess: () => {
            toast.success(messages.leaveSuccess);
          },
        }),
    });
  };

  const menu: Menu = useMemo(() => {
    const canShare = 'share' in navigator;
    const items = [];

    if (canShare) {
      items.push({
        text: intl.formatMessage(messages.share),
        icon: iconExport,
        action: handleShare,
      });
    }

    if (isAdmin) {
      items.push(null);
      items.push({
        text: intl.formatMessage(messages.leave),
        icon: iconSignOut,
        action: handleLeave,
      });
    }

    return items;
  }, [isMember, isAdmin, isInGroup]);

  if (menu.length === 0) {
    return null;
  }

  return (
    <DropdownMenu items={menu} placement='bottom'>
      <IconButton
        src={iconDotsThree}
        theme='secondary'
        className='⁂-group-options-button'
        data-testid='dropdown-menu-button'
        title={intl.formatMessage(messages.groupOptions)}
      />
    </DropdownMenu>
  );
};

export { GroupOptionsButton as default };
