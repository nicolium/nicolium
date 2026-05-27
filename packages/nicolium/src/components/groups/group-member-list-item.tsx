import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconSuitcase from '@phosphor-icons/core/regular/suitcase.svg';
import iconUserMinus from '@phosphor-icons/core/regular/user-minus.svg';
import clsx from 'clsx';
import { GroupRoles } from 'pl-api';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import DropdownMenu from '@/components/dropdown-menu/dropdown-menu';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useBlockGroupUserMutation } from '@/queries/groups/use-group-blocks';
import {
  useDemoteGroupMemberMutation,
  useKickGroupMemberMutation,
  usePromoteGroupMemberMutation,
  type MinifiedGroupMember,
} from '@/queries/groups/use-group-members';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { Menu as IMenu } from '@/components/dropdown-menu';
import type { Group } from 'pl-api';

const messages = defineMessages({
  adminLimitTitle: { id: 'group.member.admin.limit.title', defaultMessage: 'Admin limit reached' },
  adminLimitSummary: {
    id: 'group.member.admin.limit.summary',
    defaultMessage:
      'You can assign up to {count, plural, one {admin} other {admins}} for the group at this time.',
  },
  blockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban user' },
  blockFromGroupHeading: {
    id: 'confirmations.block_from_group.heading',
    defaultMessage: 'Ban from group',
  },
  blockFromGroupMessage: {
    id: 'confirmations.block_from_group.message',
    defaultMessage: 'Are you sure you want to ban @{name} from the group?',
  },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  demotedToUser: { id: 'group.demote.user.success', defaultMessage: '@{name} is now a member' },
  groupModBlock: { id: 'group.group_mod_block', defaultMessage: 'Ban from group' },
  groupModDemote: { id: 'group.group_mod_demote', defaultMessage: 'Remove {role} role' },
  groupModKick: { id: 'group.group_mod_kick', defaultMessage: 'Kick @{name} from group' },
  groupModPromoteMod: { id: 'group.group_mod_promote_mod', defaultMessage: 'Assign {role} role' },
  kickFromGroupHeading: {
    id: 'confirmations.kick_from_group.heading',
    defaultMessage: 'Kick @{name}',
  },
  kickFromGroupMessage: {
    id: 'confirmations.kick_from_group.message',
    defaultMessage: 'Are you sure you want to kick @{name} from this group?',
  },
  kickConfirm: { id: 'confirmations.kick_from_group.confirm', defaultMessage: 'Kick' },
  kicked: { id: 'group.group_mod_kick.success', defaultMessage: 'Kicked @{name} from group' },
  promoteConfirm: {
    id: 'group.promote.admin.confirmation.title',
    defaultMessage: 'Assign admin role',
  },
  promoteConfirmMessage: {
    id: 'group.promote.admin.confirmation.message',
    defaultMessage: 'Are you sure you want to assign the admin role to @{name}?',
  },
  promotedToAdmin: { id: 'group.promote.admin.success', defaultMessage: '@{name} is now an admin' },
});

interface IGroupMemberListItem {
  member: MinifiedGroupMember;
  group: Pick<Group, 'id' | 'relationship'>;
}

const GroupMemberListItem = ({ member, group }: IGroupMemberListItem) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const { mutate: blockGroupMember } = useBlockGroupUserMutation(group.id, member.account_id);
  const { mutate: kickGroupMember } = useKickGroupMemberMutation(group.id, member.account_id);
  const { mutate: promoteGroupMember } = usePromoteGroupMemberMutation(group.id);
  const { mutate: demoteGroupMember } = useDemoteGroupMemberMutation(group.id);

  const { data: account, isLoading } = useAccount(member.account_id);

  // Current user role
  const isCurrentUserOwner = group.relationship?.role === GroupRoles.OWNER;
  const isCurrentUserAdmin = group.relationship?.role === GroupRoles.ADMIN;

  // Member role
  const isMemberOwner = member.role === GroupRoles.OWNER;
  const isMemberAdmin = member.role === GroupRoles.ADMIN;
  // const isMemberModerator = membisMemberModeratorer.role === GroupRoles.MODERATOR;
  const isMemberUser = member.role === GroupRoles.USER;

  const handleKickFromGroup = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.kickFromGroupHeading, { name: account?.username }),
      message: intl.formatMessage(messages.kickFromGroupMessage, { name: account?.username }),
      confirm: intl.formatMessage(messages.kickConfirm),
      onConfirm: () => {
        kickGroupMember(undefined, {
          onSuccess: () => {
            toast.success(intl.formatMessage(messages.kicked, { name: account?.acct }));
          },
        });
      },
    });
  };

  const handleBlockFromGroup = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.blockFromGroupHeading),
      message: intl.formatMessage(messages.blockFromGroupMessage, { name: account?.username }),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => {
        blockGroupMember(undefined, {
          onSuccess() {
            toast.success(intl.formatMessage(messages.blocked, { name: account?.acct }));
          },
        });
      },
    });
  };

  const handleAdminAssignment = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.promoteConfirm),
      message: intl.formatMessage(messages.promoteConfirmMessage, { name: account?.username }),
      confirm: intl.formatMessage(messages.promoteConfirm),
      onConfirm: () => {
        promoteGroupMember(
          { accountId: member.account_id, role: GroupRoles.ADMIN },
          {
            onSuccess() {
              toast.success(intl.formatMessage(messages.promotedToAdmin, { name: account?.acct }));
            },
          },
        );
      },
    });
  };

  const handleUserAssignment = () => {
    demoteGroupMember(
      { accountId: member.account_id, role: GroupRoles.USER },
      {
        onSuccess() {
          toast.success(intl.formatMessage(messages.demotedToUser, { name: account?.acct }));
        },
      },
    );
  };

  const menu: IMenu = useMemo(() => {
    const items: IMenu = [];

    if (!group || !account || !group.relationship?.role) {
      return items;
    }

    if (isCurrentUserOwner) {
      if (isMemberUser) {
        items.push({
          text: intl.formatMessage(messages.groupModPromoteMod, { role: GroupRoles.ADMIN }),
          icon: iconSuitcase,
          action: handleAdminAssignment,
        });
      } else if (isMemberAdmin) {
        items.push({
          text: intl.formatMessage(messages.groupModDemote, {
            role: GroupRoles.ADMIN,
            name: account.username,
          }),
          icon: iconSuitcase,
          action: handleUserAssignment,
          destructive: true,
        });
      }
    }

    if (
      (isCurrentUserOwner || isCurrentUserAdmin) &&
      (isMemberAdmin || isMemberUser) &&
      member.role !== group.relationship.role
    ) {
      items.push({
        text: intl.formatMessage(messages.groupModKick, { name: account.username }),
        icon: iconUserMinus,
        action: handleKickFromGroup,
      });

      items.push({
        text: intl.formatMessage(messages.groupModBlock, { name: account.username }),
        icon: iconProhibit,
        action: handleBlockFromGroup,
        destructive: true,
      });
    }

    return items;
  }, [group, account?.id]);

  if (isLoading || !account) {
    return <PlaceholderAccount />;
  }

  return (
    <div className='group-member-list-item' data-testid='group-member-list-item'>
      <div className='group-member-list-item__account'>
        <Account account={account} withRelationship={false} />
      </div>

      <div className='group-member-list-item__actions'>
        {isMemberOwner || isMemberAdmin ? (
          <span
            data-testid='role-badge'
            className={clsx('group-member-role', {
              'group-member-role--owner': isMemberOwner,
              'group-member-role--admin': isMemberAdmin,
            })}
          >
            {member.role}
          </span>
        ) : null}

        <DropdownMenu items={menu} />
      </div>
    </div>
  );
};

export { GroupMemberListItem as default };
