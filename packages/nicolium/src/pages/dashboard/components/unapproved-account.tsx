import React from 'react';

import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons';
import Text from '@/components/ui/text';
import {
  useAdminAccount,
  useAdminApproveAccountMutation,
  useAdminRejectAccountMutation,
} from '@/queries/admin/use-accounts';

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
    <div className='flex justify-between gap-4'>
      <div className='flex flex-col gap-1'>
        <Text weight='semibold'>@{account.acct}</Text>
        <Text tag='blockquote' size='sm'>
          {adminAccount?.invite_request ?? ''}
        </Text>
      </div>

      <div className='flex flex-col justify-center'>
        <AuthorizeRejectButtons
          onAuthorize={() => {
            approveAccount();
          }}
          onReject={() => {
            rejectAccount();
          }}
          countdown={3000}
        />
      </div>
    </div>
  );
};

export { UnapprovedAccount as default };
