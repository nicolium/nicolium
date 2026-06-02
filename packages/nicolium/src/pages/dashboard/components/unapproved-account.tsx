import React from 'react';

import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons';
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
    <div className='admin-unapproved-account'>
      <div className='admin-unapproved-account__info'>
        <p>@{account.acct}</p>
        <blockquote>{adminAccount?.invite_request ?? ''}</blockquote>
      </div>

      <div className='admin-unapproved-account__actions'>
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
