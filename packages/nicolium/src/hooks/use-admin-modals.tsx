import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import OutlineBox from '@/components/outline-box';
import Text from '@/components/ui/text';
import { selectAccount } from '@/queries/accounts/selectors';
import {
  useAdminDeleteAccountMutation,
  useAdminPerformAccountActionMutation,
} from '@/queries/admin/use-accounts';
import {
  useAdminDeleteStatusMutation,
  useAdminUpdateStatusMutation,
} from '@/queries/admin/use-statuses';
import { queryKeys } from '@/queries/keys';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  deactivateUserHeading: {
    id: 'confirmations.admin.deactivate_user.heading',
    defaultMessage: 'Deactivate @{acct}',
  },
  deactivateUserConfirm: {
    id: 'confirmations.admin.deactivate_user.confirm',
    defaultMessage: 'Deactivate @{name}',
  },
  userDeactivated: {
    id: 'admin.users.user_deactivated.success',
    defaultMessage: '@{acct} was deactivated',
  },
  deleteUserHeading: {
    id: 'confirmations.admin.delete_user.heading',
    defaultMessage: 'Delete @{acct}',
  },
  deleteUserPrompt: {
    id: 'confirmations.admin.delete_user.message',
    defaultMessage:
      'You are about to delete @{acct}. THIS IS A DESTRUCTIVE ACTION THAT CANNOT BE UNDONE.',
  },
  deleteUserConfirm: {
    id: 'confirmations.admin.delete_user.confirm',
    defaultMessage: 'Delete @{name}',
  },
  deleteLocalUserCheckbox: {
    id: 'confirmations.admin.delete_local_user.checkbox',
    defaultMessage: 'I understand that I am about to delete a local user.',
  },
  userDeleted: { id: 'admin.users.user_deleted.success', defaultMessage: '@{acct} was deleted' },
  deleteStatusHeading: {
    id: 'confirmations.admin.delete_status.heading',
    defaultMessage: 'Delete post',
  },
  deleteStatusPrompt: {
    id: 'confirmations.admin.delete_status.message',
    defaultMessage: 'You are about to delete a post by @{acct}. This action cannot be undone.',
  },
  deleteStatusConfirm: {
    id: 'confirmations.admin.delete_status.confirm',
    defaultMessage: 'Delete post',
  },
  statusDeleted: {
    id: 'admin.statuses.status_deleted.success',
    defaultMessage: 'Post by @{acct} was deleted',
  },
  markStatusSensitiveHeading: {
    id: 'confirmations.admin.mark_status_sensitive.heading',
    defaultMessage: 'Mark post sensitive',
  },
  markStatusNotSensitiveHeading: {
    id: 'confirmations.admin.mark_status_not_sensitive.heading',
    defaultMessage: 'Mark post not sensitive',
  },
  markStatusSensitivePrompt: {
    id: 'confirmations.admin.mark_status_sensitive.message',
    defaultMessage: 'You are about to mark a post by @{acct} sensitive.',
  },
  markStatusNotSensitivePrompt: {
    id: 'confirmations.admin.mark_status_not_sensitive.message',
    defaultMessage: 'You are about to mark a post by @{acct} not sensitive.',
  },
  markStatusSensitiveConfirm: {
    id: 'confirmations.admin.mark_status_sensitive.confirm',
    defaultMessage: 'Mark post sensitive',
  },
  markStatusNotSensitiveConfirm: {
    id: 'confirmations.admin.mark_status_not_sensitive.confirm',
    defaultMessage: 'Mark post not sensitive',
  },
  statusMarkedSensitive: {
    id: 'admin.statuses.status_marked_message_sensitive',
    defaultMessage: 'Post by @{acct} was marked sensitive',
  },
  statusMarkedNotSensitive: {
    id: 'admin.statuses.status_marked_message_not_sensitive',
    defaultMessage: 'Post by @{acct} was marked not sensitive',
  },
});

const useDeactivateUserModal = (accountId: string) => {
  const intl = useIntl();
  const { mutate: performAccountAction } = useAdminPerformAccountActionMutation(
    accountId,
    'suspend',
  );
  const { openModal } = useModalsActions();

  return () => {
    const acct = selectAccount(accountId)!.acct;
    const name = selectAccount(accountId)!.username;

    const message = (
      <div className='flex flex-col gap-4'>
        <OutlineBox>
          <AccountContainer id={accountId} hideActions />
        </OutlineBox>

        <Text>
          <FormattedMessage
            id='confirmations.admin.deactivate_user.message'
            defaultMessage='You are about to deactivate @{acct}. Deactivating a user is a reversible action.'
            values={{ acct }}
          />
        </Text>
      </div>
    );

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deactivateUserHeading, { acct }),
      message,
      confirm: intl.formatMessage(messages.deactivateUserConfirm, { name }),
      onConfirm: () => {
        performAccountAction(undefined, {
          onSuccess: () => {
            const message = intl.formatMessage(messages.userDeactivated, { acct });
            toast.success(message);
          },
        });
      },
    });
  };
};

const useDeleteUserModal = (accountId: string) => {
  const intl = useIntl();
  const { mutate: deleteUser } = useAdminDeleteAccountMutation(accountId);
  const { openModal } = useModalsActions();
  const queryClient = useQueryClient();

  return () => {
    const account = selectAccount(accountId)!;
    const acct = account.acct;
    const name = account.username;
    const local = account.local;

    const message = (
      <div className='flex flex-col gap-4'>
        <OutlineBox>
          <AccountContainer id={accountId} hideActions />
        </OutlineBox>

        <Text>
          <FormattedMessage
            id='confirmations.admin.delete_user.message'
            defaultMessage='You are about to delete @{acct}. THIS IS A DESTRUCTIVE ACTION THAT CANNOT BE UNDONE.'
            values={{ acct }}
          />
        </Text>
      </div>
    );

    const confirm = intl.formatMessage(messages.deleteUserConfirm, { name });
    const checkbox = local ? intl.formatMessage(messages.deleteLocalUserCheckbox) : false;

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteUserHeading, { acct }),
      message,
      confirm,
      checkbox,
      onConfirm: () => {
        deleteUser(undefined, {
          onSuccess: () => {
            const message = intl.formatMessage(messages.userDeleted, { acct });
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts.show(accountId) });
            queryClient.invalidateQueries({
              queryKey: queryKeys.accounts.lookup(acct.toLocaleLowerCase()),
            });
            toast.success(message);
          },
        });
      },
    });
  };
};

const useToggleStatusSensitivityModal = (statusId: string) => {
  const intl = useIntl();
  const { mutate: updateStatus } = useAdminUpdateStatusMutation(statusId);
  const { openModal } = useModalsActions();
  const queryClient = useQueryClient();

  return (sensitive: boolean) => {
    const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
    const statusAccount = status ? selectAccount(status.account_id) : undefined;
    const acct = statusAccount?.acct;

    openModal('CONFIRM', {
      heading: intl.formatMessage(
        !sensitive ? messages.markStatusSensitiveHeading : messages.markStatusNotSensitiveHeading,
      ),
      message: intl.formatMessage(
        !sensitive ? messages.markStatusSensitivePrompt : messages.markStatusNotSensitivePrompt,
        { acct },
      ),
      confirm: intl.formatMessage(
        !sensitive ? messages.markStatusSensitiveConfirm : messages.markStatusNotSensitiveConfirm,
      ),
      onConfirm: () => {
        updateStatus(
          { sensitive: !sensitive },
          {
            onSuccess: () => {
              const message = intl.formatMessage(
                !sensitive ? messages.statusMarkedSensitive : messages.statusMarkedNotSensitive,
                { acct },
              );
              toast.success(message);
            },
          },
        );
      },
    });
  };
};

const useDeleteStatusModal = (statusId: string) => {
  const intl = useIntl();
  const { mutate: deleteStatus } = useAdminDeleteStatusMutation(statusId);
  const { openModal } = useModalsActions();
  const queryClient = useQueryClient();

  return () => {
    const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
    const statusAccount = status ? selectAccount(status.account_id) : undefined;
    const acct = statusAccount?.acct;

    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteStatusHeading),
      message: intl.formatMessage(messages.deleteStatusPrompt, { acct }),
      confirm: intl.formatMessage(messages.deleteStatusConfirm),
      onConfirm: () => {
        deleteStatus(undefined, {
          onSuccess: () => {
            const message = intl.formatMessage(messages.statusDeleted, { acct });
            toast.success(message);
          },
        });
      },
    });
  };
};

export {
  useDeactivateUserModal,
  useDeleteUserModal,
  useToggleStatusSensitivityModal,
  useDeleteStatusModal,
};
