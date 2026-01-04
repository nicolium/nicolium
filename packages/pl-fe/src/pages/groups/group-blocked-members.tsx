import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import Account from 'pl-fe/components/account';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import ColumnForbidden from 'pl-fe/features/ui/components/column-forbidden';
import { groupBlocksRoute } from 'pl-fe/features/ui/router';
import { useGroupBlocks, useUnblockGroupUserMutation } from 'pl-fe/queries/groups/use-group-blocks';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  heading: { id: 'column.group_blocked_members', defaultMessage: 'Banned members' },
  unblock: { id: 'group.group_mod_unblock', defaultMessage: 'Unban' },
  unblocked: { id: 'group.group_mod_unblock.success', defaultMessage: 'Unbanned @{name} from group' },
});

interface IBlockedMember {
  accountId: string;
  groupId: string;
}

const BlockedMember: React.FC<IBlockedMember> = ({ accountId, groupId }) => {
  const intl = useIntl();
  const { account } = useAccount(accountId);

  const { mutate: unblockGroupUser } = useUnblockGroupUserMutation(groupId, accountId);

  if (!account) return null;

  const handleUnblock = () =>
    unblockGroupUser(undefined, {
      onSuccess: () => toast.success(intl.formatMessage(messages.unblocked, { name: account.acct })),
    });

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <Button
        theme='secondary'
        text={intl.formatMessage(messages.unblock)}
        onClick={handleUnblock}
      />
    </HStack>
  );
};

const GroupBlockedMembers: React.FC = () => {
  const { groupId } = groupBlocksRoute.useParams();

  const intl = useIntl();

  const { group } = useGroup(groupId);
  const { data: accountIds } = useGroupBlocks(groupId);

  if (!group || !group.relationship || !accountIds) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const emptyMessage = <FormattedMessage id='empty_column.group_blocks' defaultMessage="The group hasn't banned any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/groups/$groupId/manage' backParams={{ groupId: group.id }}>
      <ScrollableList
        scrollKey={`groupBlockedMembers:${groupId}`}
        emptyMessageText={emptyMessage}
      >
        {accountIds.map((accountId) =>
          <BlockedMember key={accountId} accountId={accountId} groupId={groupId} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export { GroupBlockedMembers as default };
