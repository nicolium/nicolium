import { IconButton, List as PaperList, TouchableRipple } from '@mkljczk/react-native-paper';
import { Text, useTheme } from '@mkljczk/react-native-paper';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';

import { useFeatures } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useStatus } from '@/queries/statuses/use-status';
import { statusToMentionsAccountIdsArray, useCompose, useComposeActions } from '@/stores/compose';
import { useSetting } from '@/stores/settings';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { Account } from '../accounts/account';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';
import type { StyleProp, ViewStyle } from 'react-native';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  remove: { id: 'reply_mentions.account.remove', defaultMessage: 'Remove from mentions' },
  add: { id: 'reply_mentions.account.add', defaultMessage: 'Add to mentions' },
});

interface IComposeReplyMentionAccount extends ICompose {
  accountId: string;
  author: boolean;
  style?: StyleProp<ViewStyle>;
}

const ComposeReplyMentionAccount: React.FC<IComposeReplyMentionAccount> = ({
  composeId,
  accountId,
  author,
  style,
}) => {
  const intl = useIntl();

  const compose = useCompose(composeId);
  const { updateCompose } = useComposeActions();
  const { data: account } = useAccount(accountId);

  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        draft.to = draft.to?.filter((acct) => acct !== account.acct) || [];
      }
    });
  const onAdd = () =>
    updateCompose(composeId, (draft) => {
      if (account) {
        if (draft.to?.includes(account.acct)) return;
        draft.to = [...(draft.to || []), account.acct];
      }
    });

  const handlePress = () => {
    if (added) onRemove();
    else onAdd();
  };

  return (
    <Account
      key={accountId}
      id={accountId}
      style={{ ...style, paddingHorizontal: 12, paddingVertical: 8 }}
      action={
        author ? undefined : (
          <IconButton
            icon={iconHelper(added ? XIcon : PlusIcon)}
            mode={added ? 'contained-tonal' : 'outlined'}
            onPress={handlePress}
            accessibilityLabel={intl.formatMessage(added ? messages.remove : messages.add)}
          />
        )
      }
      onPress={handlePress}
    />
  );
};

interface IComposeReplyMentionsDialog extends ICompose {
  visible: boolean;
  onDismiss: () => void;
}

const ComposeReplyMentionsDialog: React.FC<IComposeReplyMentionsDialog> = ({
  composeId,
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const compose = useCompose(composeId);

  const [closing, setClosing] = React.useState(false);

  const { data: status } = useStatus(compose.inReplyToId ?? undefined);
  const { data: ownAccount } = useCredentialAccount();

  const mentions = statusToMentionsAccountIdsArray(
    status!,
    ownAccount!,
    compose.parentRebloggedById,
  );

  const intl = useIntl();

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.close),
          onPress: () => setClosing(true),
        },
        null,
      ]}
      title={<FormattedMessage id='navigation_bar.in_reply_to' defaultMessage='In reply to' />}
      forceSheet
    >
      <PaperList.Subheader style={{ marginHorizontal: -16 }}>
        <FormattedMessage
          id='navigation_bar.in_reply_to.subheading'
          defaultMessage='Mentioned accounts'
        />
      </PaperList.Subheader>
      <PaperList.Section>
        {mentions?.map((accountId, index) => (
          <ComposeReplyMentionAccount
            key={accountId}
            composeId={composeId}
            accountId={accountId}
            author={accountId === ownAccount?.id}
            style={getSegmentedMenuStyles(theme, false, index, mentions.length, 'low')}
          />
        ))}
      </PaperList.Section>
    </DialogOrSheet>
  );
};

const ComposeReplyMentions: React.FC<ICompose> = ({ composeId }) => {
  const { colors } = useTheme();

  const [showDialog, setShowDialog] = React.useState(false);

  const features = useFeatures();
  const compose = useCompose(composeId);
  const to = compose.to;

  const forceImplicitAddressing = useSetting('compose.forceImplicitAddressing');
  const explicitAddressing = features.createStatusExplicitAddressing && !forceImplicitAddressing;

  if (!explicitAddressing || !compose.inReplyToId || !to) {
    return null;
  }

  let text;

  if (to.length === 0) {
    text = (
      <Text variant='labelLarge' style={{ color: colors.primary }}>
        <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
      </Text>
    );
  } else {
    const accounts: Array<React.JSX.Element | string> = to.slice(0, 2).map((acct: string) => {
      const username = acct.split('@')[0];
      return `@${username}`;
    });

    if (to.length > 2) {
      accounts.push(
        <FormattedMessage
          id='reply_mentions.more'
          defaultMessage='{count} more'
          values={{ count: to.length - 2 }}
        />,
      );
    }

    text = (
      <Text variant='labelLarge' style={{ color: colors.primary }}>
        <FormattedMessage
          id='reply_mentions.reply'
          defaultMessage='Replying to {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </Text>
    );
  }

  return (
    <>
      <TouchableRipple onPress={() => setShowDialog(true)}>{text}</TouchableRipple>
      {showDialog && (
        <ComposeReplyMentionsDialog
          composeId={composeId}
          visible
          onDismiss={() => setShowDialog(false)}
        />
      )}
    </>
  );
};

export { ComposeReplyMentions };
