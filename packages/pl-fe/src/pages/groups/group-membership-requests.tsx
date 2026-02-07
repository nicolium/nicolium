import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useGroup } from '@/api/hooks/groups/use-group';
import { useGroupMembershipRequests } from '@/api/hooks/groups/use-group-membership-requests';
import Account from '@/components/account';
import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import HStack from '@/components/ui/hstack';
import Spinner from '@/components/ui/spinner';
import ColumnForbidden from '@/features/ui/components/column-forbidden';
import { groupMembershipRequestsRoute } from '@/features/ui/router';
import toast from '@/toast';

import type { PlfeResponse } from '@/api';
import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.group_pending_requests', defaultMessage: 'Pending requests' },
  authorizeFail: { id: 'group.group_mod_authorize.fail', defaultMessage: 'Failed to approve @{name}' },
  rejectFail: { id: 'group.group_mod_reject.fail', defaultMessage: 'Failed to reject @{name}' },
});

interface IMembershipRequest {
  account: AccountEntity;
  onAuthorize(account: AccountEntity): Promise<void>;
  onReject(account: AccountEntity): Promise<void>;
}

const MembershipRequest: React.FC<IMembershipRequest> = ({ account, onAuthorize, onReject }) => {
  if (!account) return null;

  const handleAuthorize = () => onAuthorize(account);
  const handleReject = () => onReject(account);

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <AuthorizeRejectButtons
        onAuthorize={handleAuthorize}
        onReject={handleReject}
        countdown={3000}
      />
    </HStack>
  );
};

const GroupMembershipRequests: React.FC = () => {
  const { groupId } = groupMembershipRequestsRoute.useParams();

  const intl = useIntl();

  const { group } = useGroup(groupId);

  const { accounts, authorize, reject, refetch, isLoading } = useGroupMembershipRequests(groupId);

  if (!group || !group.relationship || isLoading) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return <ColumnForbidden />;
  }

  const handleAuthorize = async (account: AccountEntity) =>
    authorize(account.id)
      .then(() => Promise.resolve())
      .catch((error: { response: PlfeResponse }) => {
        refetch();

        let message = intl.formatMessage(messages.authorizeFail, { name: account.username });
        if (error.response?.status === 409) {
          message = (error.response?.json as any).error;
        }
        toast.error(message);

        return Promise.reject();
      });

  const handleReject = async (account: AccountEntity) =>
    reject(account.id)
      .then(() => Promise.resolve())
      .catch((error: { response: PlfeResponse }) => {
        refetch();

        let message = intl.formatMessage(messages.rejectFail, { name: account.username });
        if (error.response?.status === 409) {
          message = (error.response?.json as any).error;
        }
        toast.error(message);

        return Promise.reject();
      });

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey={`groupMembershipRequests:${groupId}`}
        emptyMessageText={<FormattedMessage id='empty_column.group_membership_requests' defaultMessage='There are no pending membership requests for this group.' />}
      >
        {accounts.map((account) => (
          <MembershipRequest
            key={account.id}
            account={account}
            onAuthorize={handleAuthorize}
            onReject={handleReject}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { GroupMembershipRequests as default };
