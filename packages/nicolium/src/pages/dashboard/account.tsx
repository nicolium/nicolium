import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import { PLEROMA } from 'pl-api';
import React, { type ChangeEventHandler, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, type MessageDescriptor, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import List, { ListItem } from '@/components/list';
import MissingIndicator from '@/components/missing-indicator';
import OutlineBox from '@/components/outline-box';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import TagInput from '@/components/ui/tag-input';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useDeactivateUserModal, useDeleteUserModal } from '@/hooks/use-admin-modals';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useAdminSetRoleMutation,
  useAdminUpdateAccountCredentialsMutation,
  useAdminUpdateTagsMutation,
} from '@/queries/admin/use-accounts';
import {
  useAdminSuggestAccountMutation,
  useAdminUnsuggestAccountMutation,
} from '@/queries/admin/use-suggest-account';
import {
  useAdminVerifyAccountMutation,
  useAdminUnverifyAccountMutation,
} from '@/queries/admin/use-verify-account';
import { adminAccountRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';
import { badgeToTag, tagToBadge, getBadges } from '@/utils/badges';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  columnHeading: { id: 'column.admin.account', defaultMessage: 'Moderate @{acct}' },
  userVerified: { id: 'admin.users.user_verified_message', defaultMessage: '@{acct} was verified' },
  userUnverified: {
    id: 'admin.users.user_unverified_message',
    defaultMessage: '@{acct} was unverified',
  },
  userSuggested: {
    id: 'admin.users.user_suggested_message',
    defaultMessage: '@{acct} was suggested',
  },
  userUnsuggested: {
    id: 'admin.users.user_unsuggested_message',
    defaultMessage: '@{acct} was unsuggested',
  },
  badgesSaved: { id: 'admin.users.badges_saved_message', defaultMessage: 'Custom badges updated.' },
  badgePlaceholder: { id: 'badge_input.placeholder', defaultMessage: 'Enter a badge…' },
  roleUser: { id: 'account_moderation_modal.roles.user', defaultMessage: 'User' },
  roleModerator: { id: 'account_moderation_modal.roles.moderator', defaultMessage: 'Moderator' },
  roleAdmin: { id: 'account_moderation_modal.roles.admin', defaultMessage: 'Admin' },
  promotedToAdmin: {
    id: 'admin.users.actions.promote_to_admin_message',
    defaultMessage: '@{acct} was promoted to an admin',
  },
  promotedToModerator: {
    id: 'admin.users.actions.promote_to_moderator_message',
    defaultMessage: '@{acct} was promoted to a moderator',
  },
  demotedToModerator: {
    id: 'admin.users.actions.demote_to_moderator_message',
    defaultMessage: '@{acct} was demoted to a moderator',
  },
  demotedToUser: {
    id: 'admin.users.actions.demote_to_user_message',
    defaultMessage: '@{acct} was demoted to a regular user',
  },
  actorTypeChanged: {
    id: 'admin.users.actions.actor_type_changed_message',
    defaultMessage: '@{acct} is now a {type, select, Service {bot} Person {person} other {user}}',
  },
  changeEmailPlaceholder: {
    id: 'account_moderation_modal.change_email.placeholder',
    defaultMessage: 'New e-mail address',
  },
  emailChanged: {
    id: 'account_moderation_modal.change_email.success_message',
    defaultMessage: 'E-mail address for @{acct} changed to {email}',
  },
  changePasswordPlaceholder: {
    id: 'account_moderation_modal.change_password.placeholder',
    defaultMessage: 'New password',
  },
  passwordChanged: {
    id: 'account_moderation_modal.change_password.success_message',
    defaultMessage: 'Password for @{acct} has been changed',
  },
});

/** Staff role. */
type AccountRole = 'user' | 'moderator' | 'admin';

/** Get the highest staff role associated with the account. */
const getRole = (account: Pick<AccountEntity, 'is_admin' | 'is_moderator'>): AccountRole => {
  if (account.is_admin) {
    return 'admin';
  } else if (account.is_moderator) {
    return 'moderator';
  } else {
    return 'user';
  }
};

interface IStaffRolePicker {
  /** Account whose role to change. */
  account: Pick<AccountEntity, 'id' | 'acct' | 'is_admin' | 'is_moderator'>;
}

/** Picker for setting the staff role of an account. */
const StaffRolePicker: React.FC<IStaffRolePicker> = ({ account }) => {
  const intl = useIntl();

  const { mutate: adminSetRole } = useAdminSetRoleMutation(account.id);

  const roles: Record<AccountRole, string> = useMemo(
    () => ({
      user: intl.formatMessage(messages.roleUser),
      moderator: intl.formatMessage(messages.roleModerator),
      admin: intl.formatMessage(messages.roleAdmin),
    }),
    [],
  );

  const handleRoleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const role = e.target.value as AccountRole;

    adminSetRole(role, {
      onSuccess: () => {
        let message: MessageDescriptor | undefined;

        if (role === 'admin') {
          message = messages.promotedToAdmin;
        } else if (role === 'moderator' && account.is_admin) {
          message = messages.demotedToModerator;
        } else if (role === 'moderator') {
          message = messages.promotedToModerator;
        } else if (role === 'user') {
          message = messages.demotedToUser;
        }

        if (message) {
          toast.success(intl.formatMessage(message, { acct: account.acct }));
        }
      },
    });
  };

  const accountRole = getRole(account);

  return <SelectDropdown items={roles} defaultValue={accountRole} onChange={handleRoleChange} />;
};

interface IBadgeInput {
  /** A badge is a tag that begins with `badge:` */
  badges: string[];
  /** Callback when badges change. */
  onChange: (badges: string[]) => void;
}

/** Manages user badges. */
const BadgeInput: React.FC<IBadgeInput> = ({ badges, onChange }) => {
  const intl = useIntl();
  const tags = badges.map(badgeToTag);

  const handleTagsChange = (tags: string[]) => {
    const badges = tags.map(tagToBadge);
    onChange(badges);
  };

  return (
    <TagInput
      tags={tags}
      onChange={handleTagsChange}
      placeholder={intl.formatMessage(messages.badgePlaceholder)}
    />
  );
};

const AdminAccountPage: React.FC = () => {
  const { accountId } = adminAccountRoute.useParams();

  const intl = useIntl();
  const { openModal } = useModalsActions();

  const { mutate: suggest } = useAdminSuggestAccountMutation(accountId);
  const { mutate: unsuggest } = useAdminUnsuggestAccountMutation(accountId);
  const { mutate: verify } = useAdminVerifyAccountMutation(accountId);
  const { mutate: unverify } = useAdminUnverifyAccountMutation(accountId);
  const { data: ownAccount } = useOwnAccount();
  const features = useFeatures();
  const { data: account, isLoading } = useAccount(accountId);
  const deactivateUserModal = useDeactivateUserModal(accountId);
  const deleteUserModal = useDeleteUserModal(accountId);
  const { mutate: updateTags } = useAdminUpdateTagsMutation(accountId);
  const { mutate: updateCredentials } = useAdminUpdateAccountCredentialsMutation(accountId);

  const accountBadges = account ? getBadges(account) : [];
  const [badges, setBadges] = useState<string[]>(accountBadges);

  if (isLoading) {
    return <ColumnLoading />;
  }

  if (!account || !ownAccount) {
    return (
      <Column>
        <MissingIndicator />
      </Column>
    );
  }

  const handleAdminFE = () => {
    window.open(`/pleroma/admin/#/users/${account.id}/`, '_blank');
  };

  const handleVerifiedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userVerified : messages.userUnverified;
    const action = checked ? verify : unverify;

    action(undefined, {
      onSuccess: () => {
        toast.success(intl.formatMessage(message, { acct: account.acct }));
      },
    });
  };

  const handleSuggestedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userSuggested : messages.userUnsuggested;
    const action = checked ? suggest : unsuggest;

    action(undefined, {
      onSuccess: () => {
        toast.success(intl.formatMessage(message, { acct: account.acct }));
      },
    });
  };

  const handleIsBotChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const newActorType = checked ? 'Service' : 'Person';

    updateCredentials(
      { actor_type: newActorType },
      {
        onSuccess: () => {
          toast.success(
            intl.formatMessage(messages.actorTypeChanged, {
              acct: account.acct,
              type: newActorType,
            }),
          );
        },
      },
    );
  };

  const handleChangeEmail = () => {
    openModal('TEXT_FIELD', {
      heading: (
        <FormattedMessage
          id='account_moderation_modal.change_email.heading'
          defaultMessage='Change e-mail address for @{acct}'
          values={{ acct: account.acct }}
        />
      ),
      placeholder: intl.formatMessage(messages.changeEmailPlaceholder),
      confirm: <FormattedMessage id='common.save' defaultMessage='Save' />,
      onConfirm: (value) => {
        updateCredentials(
          { email: value },
          {
            onSuccess: () => {
              toast.success(
                intl.formatMessage(messages.emailChanged, { acct: account.acct, email: value }),
              );
            },
          },
        );
      },
      singleLine: true,
    });
  };

  const handleChangePassword = () => {
    openModal('TEXT_FIELD', {
      heading: (
        <FormattedMessage
          id='account_moderation_modal.change_password.heading'
          defaultMessage='Change password for @{acct}'
          values={{ acct: account.acct }}
        />
      ),
      message: (
        <FormattedMessage
          id='account_moderation_modal.change_password.message'
          defaultMessage='The user will be logged out from all sessions and required to use the new password the next time they log in.'
        />
      ),
      placeholder: intl.formatMessage(messages.changePasswordPlaceholder),
      confirm: <FormattedMessage id='common.save' defaultMessage='Save' />,
      onConfirm: (value) => {
        updateCredentials(
          { password: value },
          {
            onSuccess: () => {
              toast.success(intl.formatMessage(messages.passwordChanged, { acct: account.acct }));
            },
          },
        );
      },
      singleLine: true,
      type: 'password',
    });
  };

  const handleDeactivate = () => {
    deactivateUserModal();
  };

  const handleDelete = () => {
    deleteUserModal();
  };

  const handleSaveBadges = () => {
    updateTags(
      { oldTags: accountBadges, newTags: badges },
      {
        onSuccess: () => toast.success(messages.badgesSaved),
      },
    );
  };

  return (
    <Column label={intl.formatMessage(messages.columnHeading, { acct: account.acct })}>
      <div className='flex flex-col gap-4'>
        <OutlineBox>
          <Account account={account} showAccountHoverCard={false} hideActions />
        </OutlineBox>

        <List>
          {ownAccount.is_admin && account.local && (
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.account_role'
                  defaultMessage='Staff level'
                />
              }
            >
              <div className='w-auto'>
                <StaffRolePicker account={account} />
              </div>
            </ListItem>
          )}

          {features.pleromaAdminAccounts && (
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.verified'
                  defaultMessage='Verified account'
                />
              }
            >
              <Toggle checked={account.verified} onChange={handleVerifiedChange} />
            </ListItem>
          )}

          {features.suggestionsV2 && (
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.suggested'
                  defaultMessage='Suggested in people to follow'
                />
              }
            >
              <Toggle checked={account.is_suggested === true} onChange={handleSuggestedChange} />
            </ListItem>
          )}

          {features.pleromaAdminAccounts && (
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.bot'
                  defaultMessage='This account is a bot'
                />
              }
            >
              <Toggle checked={account.bot === true} onChange={handleIsBotChange} />
            </ListItem>
          )}

          {features.pleromaAdminAccounts && (
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.badges'
                  defaultMessage='Custom badges'
                />
              }
            >
              <div className='grow'>
                <div className='flex w-full items-center gap-2'>
                  <BadgeInput badges={badges} onChange={setBadges} />
                  <Button onClick={handleSaveBadges}>
                    <FormattedMessage id='common.save' defaultMessage='Save' />
                  </Button>
                </div>
              </div>
            </ListItem>
          )}
        </List>

        {features.pleromaAdminAccounts && (
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.change_email'
                  defaultMessage='Change e-mail address'
                />
              }
              onClick={handleChangeEmail}
            />
            <ListItem
              label={
                <FormattedMessage
                  id='account_moderation_modal.fields.change_password'
                  defaultMessage='Change password'
                />
              }
              onClick={handleChangePassword}
            />
          </List>
        )}

        <List>
          <ListItem
            label={
              <FormattedMessage
                id='account_moderation_modal.fields.deactivate'
                defaultMessage='Deactivate account'
              />
            }
            onClick={handleDeactivate}
          />

          <ListItem
            label={
              <FormattedMessage
                id='account_moderation_modal.fields.delete'
                defaultMessage='Delete account'
              />
            }
            onClick={handleDelete}
          />
        </List>

        <Text theme='subtle' size='xs'>
          <FormattedMessage
            id='account_moderation_modal.info.id'
            defaultMessage='ID: {id}'
            values={{ id: account.id }}
          />
        </Text>

        {features.version.software === PLEROMA && (
          <div className='flex justify-center'>
            <Button icon={iconArrowSquareOut} size='sm' theme='secondary' onClick={handleAdminFE}>
              <FormattedMessage
                id='account_moderation_modal.admin_fe'
                defaultMessage='Open in AdminFE'
              />
            </Button>
          </div>
        )}
      </div>
    </Column>
  );
};

export { AdminAccountPage as default };
