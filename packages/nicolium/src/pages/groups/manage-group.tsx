import { useNavigate } from '@tanstack/react-router';
import { GroupRoles } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import ColumnForbidden from '@/features/ui/components/column-forbidden';
import { useDeleteGroupMutation, useGroupQuery } from '@/queries/groups/use-group';
import { manageGroupRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.manage_group', defaultMessage: 'Manage group' },
  deleteHeading: { id: 'confirmations.delete_group.heading', defaultMessage: 'Delete group' },
  deleteSuccess: { id: 'group.delete.success', defaultMessage: 'Group deleted' },
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
      message: (
        <FormattedMessage
          id='confirmations.delete_group.message'
          defaultMessage='Are you sure you want to delete this group? This is a permanent action that cannot be undone.'
        />
      ),
      confirm: <FormattedMessage id='confirmations.delete_group.confirm' defaultMessage='Delete' />,
      onConfirm: () => {
        deleteGroup(undefined, {
          onSuccess() {
            toast.success(messages.deleteSuccess);
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
              <CardTitle
                title={
                  <FormattedMessage id='manage_group.edit_group' defaultMessage='Edit group' />
                }
              />
            </CardHeader>

            <List>
              <ListItem
                label={
                  <FormattedMessage id='manage_group.edit_group' defaultMessage='Edit group' />
                }
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
          <CardTitle
            title={<FormattedMessage id='group.tabs.members' defaultMessage='Members' />}
          />
        </CardHeader>

        <List>
          <ListItem
            label={
              <FormattedMessage
                id='manage_group.pending_requests'
                defaultMessage='Pending requests'
              />
            }
            to='/groups/$groupId/manage/requests'
            params={{ groupId: group.id }}
          />

          <ListItem
            label={
              <FormattedMessage id='manage_group.blocked_members' defaultMessage='Banned members' />
            }
            to='/groups/$groupId/manage/blocks'
            params={{ groupId: group.id }}
          />
        </List>

        {isOwner && (
          <>
            <CardHeader>
              <CardTitle
                title={<FormattedMessage id='settings.other' defaultMessage='Other options' />}
              />
            </CardHeader>

            <List>
              <ListItem
                label={
                  <Text theme='danger'>
                    <FormattedMessage
                      id='manage_group.delete_group'
                      defaultMessage='Delete group'
                    />
                  </Text>
                }
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
