import React from 'react';

import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAdminAccount, useAdminApproveAccountMutation, useAdminRejectAccountMutation } from 'pl-fe/queries/admin/use-accounts';

interface IUnapprovedAccount {
  accountId: string;
}

/** Displays an unapproved account for moderation purposes. */
const UnapprovedAccount: React.FC<IUnapprovedAccount> = ({ accountId }) => {
  const { data: adminAccount } = useAdminAccount(accountId);

  const { mutate: rejectAccount } = useAdminRejectAccountMutation(accountId);
  const { mutate: approveAccount } = useAdminApproveAccountMutation(accountId);

  const account = adminAccount?.account;

  if (!account) return null;

  return (
    <HStack space={4} justifyContent='between'>
      <Stack space={1}>
        <Text weight='semibold'>
          @{account.acct}
        </Text>
        <Text tag='blockquote' size='sm'>
          {adminAccount?.invite_request || ''}
        </Text>
      </Stack>

      <Stack justifyContent='center'>
        <AuthorizeRejectButtons
          onAuthorize={() => approveAccount()}
          onReject={() => rejectAccount()}
          countdown={3000}
        />
      </Stack>
    </HStack>
  );
};

export { UnapprovedAccount as default };
