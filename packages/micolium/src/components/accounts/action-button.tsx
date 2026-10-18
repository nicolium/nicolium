import { Button, IconButton } from '@mkljczk/react-native-paper';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { ToothIcon } from 'phosphor-react-native/src/icons/Tooth';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { useClient } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import {
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
} from '@/queries/accounts/use-follow-requests';

import { iconHelper } from '../ui/icon';

import { FollowButton } from './follow-button';

const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bitten @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  userBiteFailNotAllowed: {
    id: 'account.bite.fail.not_allowed',
    defaultMessage: '@{acct} does not accept bites',
  },
});

interface IActionButton {
  id: string;
  actionType?: 'follow_request' | 'biting';
}

const ActionButton: React.FC<IActionButton> = ({ id, actionType }) => {
  const intl = useIntl();
  const client = useClient();

  const { data: account } = useAccount(id, true);
  const { data: currentAccountId } = useCredentialAccountId();

  const { mutate: authorizeFollowRequest, isPending } = useAcceptFollowRequestMutation(id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(id);

  const biteAccount = () => {
    client.accounts
      .biteAccount(id)
      .then(() => {
        toast.success(intl.formatMessage(messages.userBit, { acct: account?.acct }));
      })
      .catch((error: any) => {
        if (error.response?.json?.message === 'This user does not accept bites') {
          toast.error(intl.formatMessage(messages.userBiteFailNotAllowed, { acct: account?.acct }));
        } else {
          toast.error(intl.formatMessage(messages.userBiteFail, { acct: account?.acct }));
        }
      });
  };

  if (!account || currentAccountId === id) return null;

  const relationship = account.relationship;

  if (actionType === 'follow_request' && !relationship?.followed_by) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <IconButton
          mode='outlined'
          icon={iconHelper(XIcon)}
          onPress={() => rejectFollowRequest()}
          disabled={isPending}
          loading={isPending}
          accessibilityLabel={intl.formatMessage(messages.reject)}
        />
        <IconButton
          mode='contained'
          icon={iconHelper(CheckIcon)}
          onPress={() => authorizeFollowRequest()}
          disabled={isPending}
          loading={isPending}
          accessibilityLabel={intl.formatMessage(messages.authorize)}
        />
      </View>
    );
  }

  if (actionType === 'biting') {
    return (
      <Button
        mode='contained-tonal'
        icon={iconHelper(ToothIcon)}
        onPress={() => biteAccount()}
        disabled={account.can_bite === false}
      >
        <FormattedMessage
          id='account.bite'
          defaultMessage='Bite @{name}'
          values={{ name: account.username }}
        />
      </Button>
    );
  }

  return <FollowButton id={id} simple />;
};

export { ActionButton };
