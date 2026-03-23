import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import ColumnForbidden from '@/features/ui/components/column-forbidden';
import { useAccount } from '@/queries/accounts/use-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import {
  useAcceptGroupMembershipRequestMutation,
  useGroupMembershipRequestsQuery,
  useRejectGroupMembershipRequestMutation,
} from '@/queries/groups/use-group-members';
import { groupMembershipRequestsRoute } from '@/router';
import toast from '@/toast';

import type { NicoliumResponse } from '@/api';
import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.group_pending_requests', defaultMessage: 'Pending requests' },
  authorizeFail: {
    id: 'group.group_mod_authorize.fail',
    defaultMessage: 'Failed to approve @{name}',
  },
  rejectFail: { id: 'group.group_mod_reject.fail', defaultMessage: 'Failed to reject @{name}' },
});

interface IMembershipRequest {
  accountId: string;
  onAuthorize(account: AccountEntity): Promise<void>;
  onReject(account: AccountEntity): Promise<void>;
}

const MembershipRequest: React.FC<IMembershipRequest> = ({ accountId, onAuthorize, onReject }) => {
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  const handleAuthorize = () => onAuthorize(account);
  const handleReject = () => onReject(account);

  return (
    <div className='flex items-center justify-between gap-1 p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <AuthorizeRejectButtons
        onAuthorize={handleAuthorize}
        onReject={handleReject}
        countdown={3000}
      />
    </div>
  );
};

const GroupMembershipRequests: React.FC = () => {
  const { groupId } = groupMembershipRequestsRoute.useParams();

  const intl = useIntl();

  const { data: group } = useGroupQuery(groupId, true);

  const { data: accountIds = [], isFetching } = useGroupMembershipRequestsQuery(groupId);
  const { mutate: acceptGroupMembershipRequest } = useAcceptGroupMembershipRequestMutation(groupId);
  const { mutate: rejectGroupMembershipRequest } = useRejectGroupMembershipRequestMutation(groupId);

  if (!group || !group.relationship || isFetching) {
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

  const handleAuthorize = (account: AccountEntity) =>
    new Promise<void>((resolve, reject) => {
      acceptGroupMembershipRequest(account.id, {
        onSuccess: () => resolve(),
        onError: (error) => {
          const { response } = error as unknown as { response: NicoliumResponse };

          let message = intl.formatMessage(messages.authorizeFail, { name: account.username });
          if (response?.status === 409) {
            message = response.json.error;
          }
          toast.error(message);

          reject();
        },
      });
    });

  const handleReject = (account: AccountEntity) =>
    new Promise<void>((resolve, reject) => {
      rejectGroupMembershipRequest(account.id, {
        onSuccess: () => resolve(),
        onError: (error) => {
          const { response } = error as unknown as { response: NicoliumResponse };

          let message = intl.formatMessage(messages.rejectFail, { name: account.username });
          if (response?.status === 409) {
            message = response.json.error;
          }
          toast.error(message);

          reject();
        },
      });
    });

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey={`groupMembershipRequests:${groupId}`}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.group_membership_requests'
            defaultMessage='There are no pending membership requests for this group.'
          />
        }
      >
        {accountIds.map((account) => (
          <MembershipRequest
            key={account}
            accountId={account}
            onAuthorize={handleAuthorize}
            onReject={handleReject}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { GroupMembershipRequests as default };
