import { useNavigate } from '@tanstack/react-router';
import { GroupRoles } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import ColumnForbidden from '@/features/ui/components/column-forbidden';
import { manageGroupRoute } from '@/features/ui/router';
import { useDeleteGroupMutation, useGroupQuery } from '@/queries/groups/use-group';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.manage_group', defaultMessage: 'Manage group' },
  editGroup: { id: 'manage_group.edit_group', defaultMessage: 'Edit group' },
  pendingRequests: { id: 'manage_group.pending_requests', defaultMessage: 'Pending requests' },
  blockedMembers: { id: 'manage_group.blocked_members', defaultMessage: 'Banned members' },
  deleteGroup: { id: 'manage_group.delete_group', defaultMessage: 'Delete group' },
  deleteConfirm: { id: 'confirmations.delete_group.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete_group.heading', defaultMessage: 'Delete group' },
  deleteMessage: {
    id: 'confirmations.delete_group.message',
    defaultMessage:
      'Are you sure you want to delete this group? This is a permanent action that cannot be undone.',
  },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  other: { id: 'settings.other', defaultMessage: 'Other options' },
  deleteSuccess: { id: 'group.delete.success', defaultMessage: 'Group successfully deleted' },
});

const ManageGroup: React.FC = () => {
  const { groupId } = manageGroupRoute.useParams();

  const { openModal } = useModalsActions();
  const navigate = useNavigate();
  const intl = useIntl();

  const { data: group } = useGroupQuery(groupId, true);

  const { mutate: deleteGroup } = useDeleteGroupMutation(groupId);

  const isOwner = group?.relationship?.role === GroupRoles.OWNER;

  if (!group || !group.relationship) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (
    !group.relationship.role ||
    !['owner', 'admin', 'moderator'].includes(group.relationship.role)
  ) {
    return <ColumnForbidden />;
  }

  const onDeleteGroup = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteGroup(undefined, {
          onSuccess() {
            toast.success(intl.formatMessage(messages.deleteSuccess));
            navigate({ to: '/groups' });
          },
        });
      },
    });
  };

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      backHref='/groups/$groupId'
      backParams={{ groupId: group.id }}
    >
      <CardBody className='space-y-4'>
        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.editGroup)} />
            </CardHeader>

            <List>
              <ListItem
                label={intl.formatMessage(messages.editGroup)}
                to='/groups/$groupId/manage/edit'
                params={{ groupId: group.id }}
              >
                <span>
                  <Emojify text={group.display_name} emojis={group.emojis} />
                </span>
              </ListItem>
            </List>
          </>
        )}

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.members)} />
        </CardHeader>

        <List>
          <ListItem
            label={intl.formatMessage(messages.pendingRequests)}
            to='/groups/$groupId/manage/requests'
            params={{ groupId: group.id }}
          />

          <ListItem
            label={intl.formatMessage(messages.blockedMembers)}
            to='/groups/$groupId/manage/blocks'
            params={{ groupId: group.id }}
          />
        </List>

        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.other)} />
            </CardHeader>

            <List>
              <ListItem
                label={<Text theme='danger'>{intl.formatMessage(messages.deleteGroup)}</Text>}
                onClick={onDeleteGroup}
              />
            </List>
          </>
        )}
      </CardBody>
    </Column>
  );
};

export { ManageGroup as default };
