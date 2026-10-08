import {
  Button,
  Checkbox,
  Divider,
  Menu,
  SplitButton,
  useTheme,
} from '@mkljczk/react-native-paper';
import { BellSimpleIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Alert, ViewStyle } from 'react-native';

import { useFeatures } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import {
  useFollowAccountMutation,
  useUnblockAccountMutation,
  useUnfollowAccountMutation,
} from '@/queries/accounts/use-relationship';

import { iconHelper } from '../ui/icon';

const checkboxStyle: ViewStyle = { marginLeft: -12 };

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  following: { id: 'account.following', defaultMessage: 'Following' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unfollowHeading: { id: 'confirmations.unfollow.heading', defaultMessage: 'Unfollow {name}' },
  unfollowMessage: {
    id: 'confirmations.unfollow.message',
    defaultMessage: 'Are you sure you want to unfollow {name}?',
  },
  unfollowMessageLocked: {
    id: 'confirmations.unfollow.message.locked',
    defaultMessage:
      'Are you sure you want to unfollow {name}? You will have to request to follow them again if you change your mind.',
  },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
});

interface IFollowButton {
  id: string;
  simple?: boolean;
}

const FollowButton: React.FC<IFollowButton> = ({ id, simple }) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const features = useFeatures();

  const [showMenu, setShowMenu] = useState(false);

  const { data: account } = useAccount(id, true);
  const { data: ownAccountId } = useCredentialAccount(true, ({ id }) => id);
  const { mutate: followAccount, isPending: isPendingFollow } = useFollowAccountMutation(id);
  const { mutate: unfollowAccount } = useUnfollowAccountMutation(id);
  const { mutate: unblockAccount, isPending: isPendingUnblock } = useUnblockAccountMutation(id);

  const relationship = account?.relationship;

  if (ownAccountId === id) return null;

  if (relationship?.following) {
    const handleUnfollow = () => {
      Alert.alert(
        intl.formatMessage(messages.unfollowHeading, { name: account?.username }),
        intl.formatMessage(
          account?.locked ? messages.unfollowMessageLocked : messages.unfollowMessage,
          { name: account?.acct },
        ),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.unfollowConfirm),
            style: 'destructive',
            onPress: () => unfollowAccount(),
          },
        ],
      );
      setShowMenu(false);
    };

    if (simple) {
      return (
        <Button
          mode='contained-tonal'
          onPress={handleUnfollow}
          disabled={!relationship}
          loading={isPendingFollow}
        >
          <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
        </Button>
      );
    }

    const handleToggleShowReposts = () => followAccount({ reblogs: !relationship.showing_reblogs });

    const handleToggleNotify = () => followAccount({ notify: !relationship.notifying });

    const handleToggleNotifyReplies = () =>
      followAccount({
        notify: true,
        notify_replies: !relationship.notifying_replies,
        notify_reblogs: relationship.notifying_reblogs,
      });

    const handleToggleNotifyReblogs = () =>
      followAccount({
        notify: true,
        notify_replies: relationship.notifying_replies,
        notify_reblogs: !relationship.notifying_reblogs,
      });

    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <SplitButton
            onPress={() => unfollowAccount()}
            icon={relationship.notifying ? iconHelper(BellSimpleIcon) : undefined}
            label={intl.formatMessage(messages.following)}
            onTrailingPress={() => setShowMenu(true)}
            loading={isPendingFollow}
            mode='tonal'
          />
        }
        anchorPosition='bottom'
      >
        <Menu.Item
          title={<FormattedMessage id='account.show_reblogs.short' defaultMessage='Show reposts' />}
          trailingIcon={() => (
            <Checkbox
              status={relationship.showing_reblogs ? 'checked' : 'unchecked'}
              onPress={handleToggleShowReposts}
              style={checkboxStyle}
            />
          )}
          onPress={handleToggleShowReposts}
        />
        {features.accountNotifies && (
          <Menu.Item
            title={
              <FormattedMessage
                id='account.subscribe.short'
                defaultMessage='Subscribe to notifications'
              />
            }
            trailingIcon={() => (
              <Checkbox
                status={relationship.notifying ? 'checked' : 'unchecked'}
                onPress={handleToggleNotify}
                style={checkboxStyle}
              />
            )}
            onPress={handleToggleNotify}
          />
        )}
        {features.accountNotifiesControl && (
          <>
            <Menu.Item
              title={
                <FormattedMessage
                  id='account.notify_replies.short'
                  defaultMessage='Subscribe to replies'
                />
              }
              trailingIcon={() => (
                <Checkbox
                  status={relationship.notifying_replies ? 'checked' : 'unchecked'}
                  onPress={handleToggleNotifyReplies}
                  style={checkboxStyle}
                />
              )}
              onPress={handleToggleNotifyReplies}
            />
            <Menu.Item
              title={
                <FormattedMessage
                  id='account.notify_reblogs.short'
                  defaultMessage='Subscribe to reposts'
                />
              }
              trailingIcon={() => (
                <Checkbox
                  status={relationship.notifying_reblogs ? 'checked' : 'unchecked'}
                  onPress={handleToggleNotifyReblogs}
                  style={checkboxStyle}
                />
              )}
              onPress={handleToggleNotifyReblogs}
            />
          </>
        )}
        <Divider />
        <Menu.Item
          title={<FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />}
          titleStyle={{ color: colors.error }}
          onPress={handleUnfollow}
        />
      </Menu>
    );
  }

  if (relationship?.blocking) {
    return (
      <Button mode='contained-tonal' onPress={() => unblockAccount()} loading={isPendingUnblock}>
        <FormattedMessage
          id='account.unblock'
          defaultMessage='Unblock @{name}'
          values={{ name: account?.username }}
        />
      </Button>
    );
  }

  return (
    <Button
      mode='contained'
      onPress={() => followAccount(undefined)}
      disabled={!relationship || relationship?.blocked_by}
      loading={isPendingFollow}
    >
      {relationship?.blocked_by ? (
        <FormattedMessage id='account.blocked' defaultMessage='Blocked' />
      ) : account?.locked ? (
        <FormattedMessage id='account.request_follow' defaultMessage='Request follow' />
      ) : (
        <FormattedMessage id='account.follow' defaultMessage='Follow' />
      )}
    </Button>
  );
};

export { FollowButton };
